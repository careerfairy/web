import functions = require("firebase-functions")
import { EUROPEAN_COUNTRY_CODES } from "@careerfairy/shared-lib/constants/forms"
import { TagValuesLookup } from "@careerfairy/shared-lib/constants/tags"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Group } from "@careerfairy/shared-lib/groups"
import {
   LiveStreamEventWithUsersLivestreamData,
   LivestreamEvent,
   UserLivestreamData,
} from "@careerfairy/shared-lib/livestreams"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { SparkInteractionSources } from "@careerfairy/shared-lib/sparks/telemetry"
import {
   addUtmTagsToLink,
   companyNameSlugify,
} from "@careerfairy/shared-lib/utils"
import { WriteBatch } from "firebase-admin/firestore"
import { onRequest } from "firebase-functions/v2/https"
import { DateTime } from "luxon"
import { MailgunMessageData } from "mailgun.js/interfaces/Messages"
import { TemplatedMessage } from "postmark"
import { firestore } from "./api/firestoreAdmin"
import { sendIndividualMessages } from "./api/mailgun"
import { client } from "./api/postmark"
import {
   customJobRepo,
   groupRepo,
   livestreamsRepo,
   notificationRepo,
   sparkRepo,
} from "./api/repositories"
import config from "./config"
import {
   getStreamsByDateWithRegisteredStudents,
   updateLiveStreamsWithEmailSent,
} from "./lib/livestream"
import {
   CUSTOMERIO_EMAIL_TEMPLATES,
   EmailNotificationRequestData,
} from "./lib/notifications/EmailTypes"
import { logAndThrow } from "./lib/validations"
import {
   IGenerateEmailDataProps,
   addMinutesDate,
   generateNonAttendeesReminder,
   generateReminderEmailData,
   isLocalEnvironment,
   setCORSHeaders,
} from "./util"

export const sendReminderEmailToRegistrants = functions
   .region(config.region)
   .runWith({
      // when sending large batches, this function can take a while to finish
      timeoutSeconds: 540,
      memory: "8GB",
   })
   .https.onRequest(async (req, res) => {
      setCORSHeaders(req, res)

      try {
         const users = await livestreamsRepo.getLivestreamUsers(
            req.body.livestreamId,
            "registered"
         )

         const templates = []
         users?.forEach((recipient) => {
            const email = {
               TemplateId: req.body.templateId,
               From: "CareerFairy <noreply@careerfairy.io>",
               To: recipient.id,
               TemplateModel: {
                  firstName: recipient.user.firstName,
               },
            }
            templates.push(email)
         })
         const arraysOfTemplates = []
         let myChunk
         for (let index = 0; index < templates.length; index += 500) {
            myChunk = templates.slice(index, index + 500)
            // Do something if you want with the group
            arraysOfTemplates.push(myChunk)
         }
         console.log(arraysOfTemplates.length)
         arraysOfTemplates.forEach((arrayOfTemplates) => {
            client.sendEmailBatchWithTemplates(arrayOfTemplates).then(
               () => {
                  console.log(
                     `Successfully sent email to ${arrayOfTemplates.length}`
                  )
               },
               (error) => {
                  console.error(
                     `Error sending email to ${arrayOfTemplates.length}`,
                     error
                  )
               }
            )
         })
      } catch (error) {
         logAndThrow(error, "Error sending reminder email to registrants")
      }
   })

export const sendReminderEmailAboutApplicationLink = functions
   .region(config.region)
   .runWith({
      // when sending large batches, this function can take a while to finish
      timeoutSeconds: 540,
      memory: "8GB",
   })
   .https.onCall(async (data) => {
      functions.logger.log("data", data)
      const email = {
         TemplateId: parseInt(
            process.env.POSTMARK_TEMPLATE_REMINDER_JOB_POSTING_APPLICATION
         ),
         From: "CareerFairy <noreply@careerfairy.io>",
         To: data.recipient,
         TemplateModel: {
            recipient_name: data.recipient_name,
            application_link: addUtmTagsToLink({
               link: data.application_link,
               campaign: "jobApplication",
               content: data.position_name,
            }),
            position_name: data.position_name,
         },
      } as TemplatedMessage

      client.sendEmailWithTemplate(email).then(
         () => {
            functions.logger.log(`Sent reminder email to ${data.recipient}`)
         },
         (error) => {
            console.error(`Error sending email to ${data.recipient}`, error)
            throw new functions.https.HttpsError("unknown", error)
         }
      )
   })

// delay to be sure that the reminder is sent at the time
const reminderDateDelay = 20

// range to how many minutes we will search
const reminderScheduleRange = 20

// Maximum size of each email chunk
const emailMaxChunkSize = 950

type LivestreamFollowUpAdditionalData = {
   groups: {
      groupsByLivestreamId: Record<string, Group>
      groupSparks: Record<string, Spark[]>
   }
   livestream: {
      jobsByLivestreamId: Record<string, CustomJob[]>
   }
}

export type ReminderData = {
   timeMessage?: string
   minutesBefore?: number
   key:
      | "reminder5Minutes"
      | "reminder1Hour"
      | "reminder24Hours"
      | "reminderTodayMorning"
      | "reminderRecordingNow"
   template: string
}

export type EmailChunks = Record<
   string,
   {
      reminderKey: ReminderData["key"]
      streamId: string
      chunks: EmailChunk["chunk"][]
   }
>

export const ReminderCampaignMap: Record<ReminderData["key"], string> = {
   reminder5Minutes: "reminder-5min",
   reminder1Hour: "reminder-1h",
   reminder24Hours: "reminder-24h",
   reminderRecordingNow: "reminder-recording-now",
   reminderTodayMorning: "reminder-today-morning",
}

const Reminder5Min: ReminderData = {
   template: "lsreminder5min",
   timeMessage: "NOW",
   minutesBefore: 5,
   key: "reminder5Minutes",
}

const Reminder1Hour: ReminderData = {
   template: "lsreminder1h",
   timeMessage: "in 1 hour",
   minutesBefore: 60,
   key: "reminder1Hour",
}

const Reminder24Hours: ReminderData = {
   template: "lsreminder24h",
   timeMessage: "TOMORROW",
   minutesBefore: 1440,
   key: "reminder24Hours",
}

const ReminderRecordingNow = {
   template: "reminder_for_recording",
   key: "reminderRecordingNow",
} satisfies ReminderData

/**
 * Runs every {reminderScheduleRange} minutes to handle all the 5 minutes, 1 hour and 1 day livestream email reminders
 * The {reminderDateDelay} is the number of minutes we want to delay in the future, to be sure that our logic runs before being required to send the reminders
 *
 * So we will be looking for streams that start on current date + {reminderDateDelay}
 */
export const scheduleReminderEmails = functions
   .region(config.region)
   .runWith({
      // when sending large batches, this function can take a while to finish
      timeoutSeconds: 540,
      memory: "8GB",
   })
   .pubsub.schedule("every 15 minutes")
   .timeZone("Europe/Zurich")
   .onRun(() => {
      const batch = firestore.batch()
      functions.logger.log(
         `Running reminder check at ${new Date().toLocaleString()}`
      )

      const dateStart = addMinutesDate(new Date(), reminderDateDelay)
      const dateEndFor5Minutes = addMinutesDate(
         dateStart,
         reminderScheduleRange
      )
      const reminder5MinutesPromise = handleReminder(
         batch,
         dateStart,
         dateEndFor5Minutes,
         Reminder5Min
      )

      const dateStartFor1Hour = addMinutesDate(
         dateStart,
         Reminder1Hour.minutesBefore
      )
      const dateEndFor1Hour = addMinutesDate(
         dateStartFor1Hour,
         reminderScheduleRange
      )
      const reminder1HourPromise = handleReminder(
         batch,
         dateStartFor1Hour,
         dateEndFor1Hour,
         Reminder1Hour
      )

      const dateStartFor24Hours = addMinutesDate(
         dateStart,
         Reminder24Hours.minutesBefore
      )
      const dateEndFor24Hours = addMinutesDate(
         dateStartFor24Hours,
         reminderScheduleRange
      )
      const reminder24HoursPromise = handleReminder(
         batch,
         dateStartFor24Hours,
         dateEndFor24Hours,
         Reminder24Hours
      )

      return Promise.allSettled([
         reminder5MinutesPromise,
         reminder1HourPromise,
         reminder24HoursPromise,
      ]).then(async (results) => {
         await batch.commit()

         const rejectedPromises = results.filter(
            ({ status }) => status === "rejected"
         )
         if (rejectedPromises.length > 0) {
            const errorMessage = `${rejectedPromises.length} reminders were not sent`
            functions.logger.error(errorMessage)
            // Google Cloud monitoring should create an incident
            throw new Error(errorMessage)
         }
      })
   })

/**
 * Manual testing instructions:
 *
 * 1. To test reminders: Update reminder{time}HoursPromise with a future date to ensure live streams are fetched
 *
 * 2. Email sending options:
 *    - Use sandbox server if possible
 *    - If using production domain (405 error case, see mailgun.ts):
 *      WARNING: Create test events where you are the only registrant to avoid sending emails to real users
 *
 * 3. To retest a reminder:
 *    Delete the specific reminder field (e.g. reminder1Hour) from `reminderEmailsSent`
 *    in `/livestream/{stream_id}` collection
 */
export const manualReminderEmails = onRequest(async () => {
   const batch = firestore.batch()

   const dateStart = addMinutesDate(new Date(), reminderDateDelay)
   const dateEndFor5Minutes = addMinutesDate(dateStart, reminderScheduleRange)

   console.log(
      "🚀 ~ manualReminderEmails - dateEndFor5Minutes.:",
      dateEndFor5Minutes
   )

   const reminder5MinutesPromise = handleReminder(
      batch,
      dateStart,
      DateTime.now().plus({ month: 5 }).toJSDate(),
      Reminder5Min
   )

   // const dateStartFor1Hour = addMinutesDate(
   //    dateStart,
   //    Reminder1Hour.minutesBefore
   // )
   // const dateEndFor1Hour = addMinutesDate(
   //    dateStartFor1Hour,
   //    reminderScheduleRange
   // )
   // const reminder1HourPromise = handleReminder(
   //    batch,
   //    dateStartFor1Hour,
   //    DateTime.now().plus({ month: 5 }).toJSDate(),
   //    Reminder1Hour
   // )

   // const dateStartFor24Hours = addMinutesDate(
   //    dateStart,
   //    Reminder24Hours.minutesBefore
   // )
   // const dateEndFor24Hours = addMinutesDate(
   //    dateStartFor24Hours,
   //    reminderScheduleRange
   // )
   // const reminder24HoursPromise = handleReminder(
   //    batch,
   //    dateStartFor24Hours,
   //    DateTime.now().plus({ month: 5 }).toJSDate(),
   //    Reminder24Hours
   // )

   return Promise.allSettled([
      reminder5MinutesPromise,
      // reminder1HourPromise,
      // reminder24HoursPromise,
   ]).then(async (results) => {
      await batch.commit()

      const rejectedPromises = results.filter(
         ({ status }) => status === "rejected"
      )
      if (rejectedPromises.length > 0) {
         const errorMessage = `${rejectedPromises.length} reminders were not sent`
         functions.logger.error(errorMessage)
         // Google Cloud monitoring should create an incident
         throw new Error(errorMessage)
      }
   })
})

/**
 * Every day at 9 AM, check all the livestreams that ended the day before and send a reminder to all the non-attendees at 11 AM.
 */
export const sendReminderToNonAttendees = functions
   .region(config.region)
   .runWith({
      // when sending large batches, this function can take a while to finish
      timeoutSeconds: 540,
      memory: "8GB",
   })
   .pubsub.schedule("0 11 * * *")
   .timeZone("Europe/Zurich")
   .onRun(async () => {
      await sendAttendeesReminder(
         CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_FOLLOWUP_NON_ATTENDEES
      )
   })

export const sendReminderToAttendees = functions
   .region(config.region)
   .runWith({
      // when sending large batches, this function can take a while to finish
      timeoutSeconds: 540,
      memory: "8GB",
   })
   .pubsub.schedule("0 11 * * *")
   .timeZone("Europe/Zurich")
   .onRun(async () => {
      await sendAttendeesReminder(
         CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_FOLLOWUP_ATTENDEES
      )
   })

export const testSendReminderToNonAttendees = onRequest(async (req, res) => {
   // Update ids according to testing data
   const testEvents = await livestreamsRepo.getLivestreamsByIds([
      "LQTy4JdeRBqGUtULeNir",
      // "6UX9IBp6otoVwGwis8EJ",
   ])

   // Toggle between attendees or non-attendees
   await sendAttendeesReminder(
      CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_FOLLOWUP_NON_ATTENDEES,
      testEvents
   )

   res.status(200).send("Test non attendees done")
})

/**
 * Trigger to send reminders for all the nonAttendees by stream id
 */
export const sendReminderForNonAttendeesByStreamId = functions
   .region(config.region)
   .runWith({
      // when sending large batches, this function can take a while to finish
      timeoutSeconds: 540,
      memory: "8GB",
   })
   .https.onRequest(async (req, res) => {
      setCORSHeaders(req, res)
      const livestreamId = req.query.eventId as string

      if (livestreamId) {
         try {
            const livestream = await livestreamsRepo.getById(livestreamId)
            const livestreamPresenter =
               LivestreamPresenter.createFromDocument(livestream)

            if (
               !livestreamPresenter.isLive() &&
               livestreamPresenter.streamHasFinished()
            ) {
               const nonAttendees = await livestreamsRepo.getNonAttendees(
                  livestreamId
               )
               if (nonAttendees.length) {
                  const livestreamWithNonAttendees = {
                     ...livestream,
                     usersLivestreamData: nonAttendees as UserLivestreamData[],
                  } as LiveStreamEventWithUsersLivestreamData

                  await handleSendEmail(
                     [livestreamWithNonAttendees],
                     ReminderRecordingNow,
                     generateNonAttendeesReminder
                  )
                  res.sendStatus(200)
               } else {
                  functions.logger.log("No nonAttendees were found")
                  res.sendStatus(404)
               }
            } else {
               functions.logger.log("The livestream has not ended yet")
               res.sendStatus(404)
            }
         } catch (error) {
            functions.logger.error(
               "error in sending reminder to non attendees when triggered",
               error
            )
            throw new functions.https.HttpsError("unknown", error)
         }
      } else {
         functions.logger.log(
            "The livestream has not ended yet or does not exist"
         )
         res.sendStatus(404)
      }
   })

/**
 * Search for a stream that will start between {filterStartDate} and {filterEndDate} + {reminderScheduleRange} minutes and schedule the reminder.
 *
 */
const handleReminder = async (
   batch: WriteBatch,
   filterStartDate: Date,
   filterEndDate: Date,
   reminder: ReminderData
) => {
   try {
      const streams = await getStreamsByDateWithRegisteredStudents(
         filterStartDate,
         filterEndDate
      )

      functions.logger.log(
         `Found ${streams
            .map((s) => s.id)
            .join(
               ", "
            )} streams that will start between ${filterStartDate.toLocaleString()} and ${filterEndDate.toLocaleString()} and will be reminded ${
            reminder.timeMessage
         }`
      )

      const allGroups = await Promise.all(
         streams.map((stream) =>
            groupRepo.getGroupsByIds(stream.groupIds).then((groups) => {
               return {
                  streamId: stream.id,
                  group: groups.find((g) => !g.universityCode) || groups[0],
               }
            })
         )
      )

      const streamGroups: Record<string, Group> = {}

      allGroups.forEach((groupData) => {
         streamGroups[groupData.streamId] = groupData.group
      })

      const emailsToSave = await handleSendEmail(
         streams,
         reminder,
         (params) => {
            return generateReminderEmailData({
               ...params,
               streamGroup: streamGroups[params.stream.id],
               reminderKey: reminder.key,
               reminderCampaign: ReminderCampaignMap[reminder.key],
            })
         }
      )

      functions.logger.log(
         `Found ${
            Object.keys(emailsToSave || {}).length
         } emails to save for reminder ${reminder.key}`
      )

      if (emailsToSave) {
         // update batch with all the successfully sent reminders on the DB
         return updateLiveStreamsWithEmailSent(batch, emailsToSave)
      }
   } catch (error) {
      functions.logger.error(
         `Error handling reminder with template ${reminder.key}`,
         error
      )
      throw new functions.https.HttpsError("unknown", error)
   }
}

type EmailChunk = {
   reminderKey: ReminderData["key"]
   streamId: string
   chunk: `${number}of${number}`
}

/**
 * It creates emailData based on the stream and the reminder information and sends the email to all the streams that are not FaceToFace.
 *
 */
const handleSendEmail = async (
   streams: LiveStreamEventWithUsersLivestreamData[],
   reminder: ReminderData,
   handleGenerateEmailData: (
      props: Omit<IGenerateEmailDataProps, "streamGroup">
   ) => MailgunMessageData[]
) => {
   const promiseArrayToSendMessages: Promise<EmailChunk>[] = []
   const { minutesBefore } = reminder

   streams.forEach((stream) => {
      const { isFaceToFace, company } = stream

      if (isFaceToFace) {
         functions.logger.log(
            `Livestream with ${company} is F2F, no reminder email sent out`
         )
      } else {
         functions.logger.log(
            `Generating reminder email for livestream ${stream.id}`
         )
         const emailsData = handleGenerateEmailData({
            stream,
            reminder,
            minutesToRemindBefore: minutesBefore,
            emailMaxChunkSize,
         })

         functions.logger.log(
            `Generated ${emailsData.length} emails for livestream ${stream.id}`
         )

         emailsData.forEach((emailData, index) => {
            const currentChunk = `${index + 1}of${emailsData.length}` as const

            // We only want to send the current email chunk reminder if it hasn't already been sent
            if (wasEmailChunkNotYetSent(stream, reminder.key, currentChunk)) {
               promiseArrayToSendMessages.push(
                  createSendEmailPromise(
                     emailData,
                     reminder,
                     stream,
                     currentChunk
                  )
               )
            }
         })
      }
   })

   if (promiseArrayToSendMessages.length === 0) {
      return null
   }

   return Promise.allSettled(promiseArrayToSendMessages).then((results) => {
      return results.reduce<EmailChunks>((acc, currentResult) => {
         if (currentResult.status === "fulfilled") {
            const { reminderKey, streamId, chunk } = currentResult.value

            functions.logger.log(
               `Email ${reminderKey} with chunk ${chunk} was sent successfully for the stream ${streamId}`
            )
            return {
               ...acc,
               [streamId]: {
                  reminderKey,
                  streamId,
                  chunks: acc?.[streamId]?.chunks?.length
                     ? [...acc[streamId].chunks, chunk]
                     : [chunk],
               },
            }
         } else {
            functions.logger.error(currentResult.reason)
         }
         return acc
      }, {})
   })
}

type FollowUpTemplateId =
   | typeof CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_FOLLOWUP_ATTENDEES
   | typeof CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_FOLLOWUP_NON_ATTENDEES

const getCustomerioTemplateMessages = (
   templateId: FollowUpTemplateId,
   streams: LiveStreamEventWithUsersLivestreamData[],
   additionalData: LivestreamFollowUpAdditionalData
): EmailNotificationRequestData<FollowUpTemplateId>[] => {
   const host = isLocalEnvironment()
      ? "http://localhost:3000"
      : "https://careerfairy.io"

   const templateMessages: EmailNotificationRequestData<FollowUpTemplateId>[] =
      []

   streams.forEach((stream) => {
      const streamGroup = additionalData.groups.groupsByLivestreamId[stream.id]
      const speakers = stream.speakers ?? []

      const groupSparks = additionalData.groups.groupSparks[streamGroup.id]
         .sort((sparkA, sparkB) => {
            return sparkB.publishedAt.toMillis() - sparkA.publishedAt.toMillis()
         })
         .slice(0, 3)
         .map((spark) => {
            return {
               question: spark.question,
               category_id: spark.category.name,
               thumbnailUrl: spark.video.thumbnailUrl,
               url: addUtmTagsToLink({
                  link: `${host}/sparks/${
                     spark.id
                  }?companyName=${companyNameSlugify(
                     streamGroup.universityName
                  )}&groupId=${streamGroup.id}&interactionSource=${
                     SparkInteractionSources.Livestream_Follow_Up
                  }`,
                  source: "careerfairy",
                  medium: "email",
                  campaign: "event-followup",
                  content: stream.title,
               }),
            }
         })

      const streamSpeakers = speakers.slice(0, 4).map((speaker) => {
         const speakerLink = addUtmTagsToLink({
            link: `${host}/portal/livestream/${stream.id}/speaker-details/${speaker.id}`,
            source: "careerfairy",
            medium: "email",
            campaign: "event-followup",
            content: stream.title,
         })

         return {
            name: `${speaker.firstName} ${speaker.lastName}`,
            position: speaker.position,
            avatarUrl: speaker.avatar,
            url: speakerLink,
            linkedInUrl: speaker.linkedInUrl,
         }
      })

      const streamJobs = additionalData.livestream.jobsByLivestreamId[
         stream.id
      ].map((job) => {
         return {
            title: job.title,
            jobType: job.jobType,
            businessFunctionsTags: (
               job.businessFunctionsTagIds?.map(
                  (tag) => TagValuesLookup[tag]
               ) ?? []
            ).join(", "),
            deadline: DateTime.fromJSDate(job.deadline.toDate()).toFormat(
               "dd LLL yyyy"
            ),
            url: addUtmTagsToLink({
               link: `${host}/portal/livestream/${stream.id}/job-details/${job.id}`,
               source: "careerfairy",
               medium: "email",
               campaign: "event-followup",
               content: stream.title,
            }),
         }
      })

      stream.usersLivestreamData.forEach((streamUserData) => {
         const userInEU = EUROPEAN_COUNTRY_CODES.includes(
            streamUserData.user.universityCountryCode
         )

         const speakers = streamSpeakers.map((speaker) => ({
            ...speaker,
            url:
               userInEU && speaker.linkedInUrl
                  ? speaker.linkedInUrl
                  : speaker.url,
         }))

         templateMessages.push({
            to: streamUserData.user.userEmail,
            templateId: templateId,
            userAuthId: streamUserData.user.id,
            templateData: {
               livestream: {
                  company: streamGroup.universityName,
                  companyBannerImageUrl: streamGroup.bannerImageUrl,
                  details_url: addUtmTagsToLink({
                     link: `${host}/portal/livestream/${stream.id}`,
                     source: "careerfairy",
                     medium: "email",
                     campaign: "event-followup",
                     content: stream.title,
                  }),
               },
               jobs: streamJobs,
               speakers: speakers,
               sparks: groupSparks,
               allowsRecording: !stream.denyRecordingAccess,
            },
         })
      })
   })

   return templateMessages
}
/**
 * To create sendEmail promise and handling the possible error
 *
 */
const createSendEmailPromise = async (
   emailData: MailgunMessageData,
   reminder: ReminderData,
   stream: LiveStreamEventWithUsersLivestreamData,
   currentChunk: `${number}of${number}`
) => {
   const { id } = stream
   const { key } = reminder

   try {
      await sendIndividualMessages(emailData)
      functions.logger.log(
         `Email ${key} with chunk ${currentChunk} was sent for stream ${id}`
      )
      return { reminderKey: key, streamId: id, chunk: currentChunk }
   } catch (error) {
      throw new Error(
         `Email ${key} with chunk ${currentChunk} was not sent for stream ${id} with the error ${error?.message}`
      )
   }
}

/**
 * To validate if the received Email Chunk has not yet been sent
 *
 */
const wasEmailChunkNotYetSent = (
   stream: LiveStreamEventWithUsersLivestreamData,
   reminderKey: string,
   currentChunk: string
): boolean => {
   if (stream.reminderEmailsSent) {
      const firebaseChunks = stream.reminderEmailsSent[reminderKey]
      return !firebaseChunks?.includes(currentChunk)
   }

   return true
}

const sendAttendeesReminder = async (
   templateId: FollowUpTemplateId,
   events?: LivestreamEvent[]
) => {
   try {
      const yesterdayLivestreams = events?.length
         ? events
         : await livestreamsRepo.getYesterdayLivestreams()

      if (yesterdayLivestreams.length) {
         const livestreamsToRemind = await yesterdayLivestreams.reduce<
            Promise<LiveStreamEventWithUsersLivestreamData[]>
         >(async (acc, livestream) => {
            const livestreamPresenter =
               LivestreamPresenter.createFromDocument(livestream)

            if (
               !livestreamPresenter.isTest() &&
               !livestreamPresenter.isLive() &&
               livestreamPresenter.streamHasFinished()
            ) {
               functions.logger.log(
                  `Detected livestream ${livestreamPresenter.title} has ended yesterday`
               )

               const attendeesData =
                  templateId ===
                  CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_FOLLOWUP_ATTENDEES
                     ? await livestreamsRepo.getAttendees(livestream.id)
                     : await livestreamsRepo.getNonAttendees(livestream.id)

               if (attendeesData.length) {
                  const livestreamAttendees = {
                     ...livestream,
                     usersLivestreamData: attendeesData,
                  }

                  functions.logger.log(
                     `Will send the reminder to ${attendeesData.length} users related to the Livestream ${livestreamPresenter.title}`
                  )

                  return [...(await acc), livestreamAttendees]
               } else {
                  functions.logger.log(
                     `No Attendees were found on ${livestreamPresenter.title}`
                  )
               }
            } else {
               functions.logger.log(
                  `The livestream ${livestreamPresenter.title} has not ended yet`
               )
            }
            return await acc
         }, Promise.resolve([]))

         const groupsByEventIds: Record<string, Group> = {}

         const groupSparks: Record<string, Spark[]> = {}

         const livestreamJobs: Record<string, CustomJob[]> = {}

         await Promise.all(
            livestreamsToRemind.map((event) =>
               groupRepo.getGroupsByIds(event.groupIds).then((groups) => {
                  groupsByEventIds[event.id] =
                     groups.find((group) => !group.universityCode) ??
                     groups.at(0)
               })
            )
         )

         const groupSparksPromises = Object.values(groupsByEventIds).map(
            async (group) => {
               groupSparks[group.id] = group.publicSparks
                  ? (await sparkRepo.getSparksByGroupId(group.id)) ?? []
                  : []
            }
         )

         const livestreamJobsPromises = livestreamsToRemind.map(
            async (event) => {
               livestreamJobs[event.id] = event.hasJobs
                  ? (await customJobRepo.getCustomJobsByLivestreamId(
                       event.id
                    )) ?? []
                  : []
            }
         )

         await Promise.all([...groupSparksPromises, ...livestreamJobsPromises])

         const additionalData: LivestreamFollowUpAdditionalData = {
            groups: {
               groupsByLivestreamId: groupsByEventIds,
               groupSparks: groupSparks,
            },
            livestream: {
               jobsByLivestreamId: livestreamJobs,
            },
         }

         const emailTemplates = getCustomerioTemplateMessages(
            templateId,
            livestreamsToRemind,
            additionalData
         )

         await notificationRepo.sendEmailNotifications(emailTemplates)

         functions.logger.log("attendees reminders sent")
      } else {
         functions.logger.log("No livestream has ended yesterday")
      }
   } catch (error) {
      functions.logger.error(
         "error in sending reminder to attendees when livestreams ends",
         error
      )
      throw new functions.https.HttpsError("unknown", error)
   }
}
