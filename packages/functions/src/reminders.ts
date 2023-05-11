import functions = require("firebase-functions")
import config from "./config"
import { client } from "./api/postmark"
import { admin } from "./api/firestoreAdmin"
import {
   addMinutesDate,
   generateNonAttendeesReminder,
   generateReminderEmailData,
   IGenerateEmailDataProps,
   setCORSHeaders,
} from "./util"
import { sendMessage } from "./api/mailgun"
import { TemplatedMessage } from "postmark"
import {
   LiveStreamEventWithUsersLivestreamData,
   UserLivestreamData,
} from "@careerfairy/shared-lib/livestreams"
import { MailgunMessageData } from "mailgun.js/interfaces/Messages"
import {
   getStreamsByDateWithRegisteredStudents,
   updateLiveStreamsWithEmailSent,
} from "./lib/livestream"
import { addUtmTagsToLink } from "@careerfairy/shared-lib/utils"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { livestreamsRepo } from "./api/repositories"

export const sendReminderEmailToRegistrants = functions
   .region(config.region)
   .https.onRequest(async (req, res) => {
      setCORSHeaders(req, res)

      let registeredUsers = []
      admin
         .firestore()
         .collection("livestreams")
         .doc(req.body.livestreamId)
         .get()
         .then((doc) => {
            registeredUsers = doc.data().registeredUsers
            const templates = []
            registeredUsers.forEach((recipient) => {
               const email = {
                  TemplateId: req.body.templateId,
                  From: "CareerFairy <noreply@careerfairy.io>",
                  To: recipient,
                  TemplateModel: {},
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
         })
         .catch(() => {
            return res.status(400).send()
         })
   })

export const sendReminderEmailAboutApplicationLink = functions
   .region(config.region)
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

const Reminder5Min: ReminderData = {
   template: "5-min-reminder",
   timeMessage: "NOW",
   minutesBefore: 5,
   key: "reminder5Minutes",
}

const Reminder1Hour: ReminderData = {
   template: "1-h-reminder",
   timeMessage: "in 1 hour",
   minutesBefore: 60,
   key: "reminder1Hour",
}

const Reminder24Hours: ReminderData = {
   template: "24-h-reminder",
   timeMessage: "TOMORROW",
   minutesBefore: 1440,
   key: "reminder24Hours",
}

const ReminderTodayMorning: ReminderData = {
   template: "reminder_for_recording",
   key: "reminderTodayMorning",
}
const ReminderRecordingNow: ReminderData = {
   template: "reminder_for_recording",
   key: "reminderRecordingNow",
}

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
      timeoutSeconds: 300,
   })
   .pubsub.schedule("every 15 minutes")
   .timeZone("Europe/Zurich")
   .onRun(() => {
      const batch = admin.firestore().batch()

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
 * Every day at 9 AM, check all the livestreams that ended the day before and send a reminder to all the non-attendees at 11 AM.
 */
export const sendReminderToNonAttendees = functions
   .region(config.region)
   .runWith({
      // when sending large batches, this function can take a while to finish
      timeoutSeconds: 300,
   })
   .pubsub.schedule("0 9 * * *")
   .timeZone("Europe/Zurich")
   .onRun(async () => {
      try {
         const yesterdayLivestreams =
            await livestreamsRepo.getYesterdayLivestreams()

         if (yesterdayLivestreams.length) {
            const livestreamsToRemind = await yesterdayLivestreams.reduce(
               async (acc, livestream) => {
                  const livestreamPresenter =
                     LivestreamPresenter.createFromDocument(livestream)

                  if (
                     livestreamPresenter.isAbleToAccessRecording() &&
                     !livestreamPresenter.isTest() &&
                     !livestreamPresenter.isLive() &&
                     livestreamPresenter.streamHasFinished()
                  ) {
                     functions.logger.log(
                        `Detected livestream ${livestreamPresenter.title} has ended yesterday`
                     )

                     const nonAttendees = await livestreamsRepo.getNonAttendees(
                        livestream.id
                     )

                     if (nonAttendees.length) {
                        const livestreamWithNonAttendees = {
                           ...livestream,
                           usersLivestreamData:
                              nonAttendees as UserLivestreamData[],
                        } as LiveStreamEventWithUsersLivestreamData

                        functions.logger.log(
                           `Will send the reminder to ${nonAttendees.length} users related to the Livestream ${livestreamPresenter.title}`
                        )

                        return [...(await acc), livestreamWithNonAttendees]
                     } else {
                        functions.logger.log(
                           `No nonAttendees were found on ${livestreamPresenter.title}`
                        )
                     }
                  } else {
                     functions.logger.log(
                        `The livestream ${livestreamPresenter.title} has not ended yet`
                     )
                  }
                  return await acc
               },
               Promise.resolve([] as LiveStreamEventWithUsersLivestreamData[])
            )

            await handleSendEmail(
               livestreamsToRemind,
               ReminderTodayMorning,
               generateNonAttendeesReminder
            )
         } else {
            functions.logger.log("No livestream has ended yesterday")
         }
      } catch (error) {
         functions.logger.error(
            "error in sending reminder to non attendees when livestreams ends",
            error
         )
         throw new functions.https.HttpsError("unknown", error)
      }
   })

/**
 * Trigger to send reminders for all the nonAttendees by stream id
 */
export const sendReminderForNonAttendeesByStreamId = functions
   .region(config.region)
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
   batch: admin.firestore.WriteBatch,
   filterStartDate: Date,
   filterEndDate: Date,
   reminder: ReminderData
) => {
   try {
      const streams = await getStreamsByDateWithRegisteredStudents(
         filterStartDate,
         filterEndDate
      )

      const emailsToSave = await handleSendEmail(
         streams,
         reminder,
         generateReminderEmailData
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

/**
 * It creates emailData based on the stream and the reminder information and sends the email to all the streams that are not FaceToFace.
 *
 */
const handleSendEmail = (
   streams: LiveStreamEventWithUsersLivestreamData[],
   reminder: ReminderData,
   handleGenerateEmailData: (
      props: IGenerateEmailDataProps
   ) => MailgunMessageData[]
) => {
   const promiseArrayToSendMessages = []
   const { minutesBefore } = reminder

   streams.forEach((stream) => {
      const { isFaceToFace, company } = stream

      if (isFaceToFace) {
         functions.logger.log(
            `Livestream with ${company} is F2F, no reminder email sent out`
         )
      } else {
         const emailsData = handleGenerateEmailData({
            stream,
            reminder,
            minutesToRemindBefore: minutesBefore,
            emailMaxChunkSize,
         })

         emailsData.forEach((emailData, index) => {
            const currentChunk = `${index + 1}of${emailsData.length}`

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
      return results.reduce((acc: any, currentResult: any) => {
         const { status, value, reason } = currentResult

         if (status === "fulfilled") {
            const { reminderKey, streamId, chunk } = value

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
         }
         if (status === "rejected") {
            functions.logger.error(reason)
         }
         return acc
      }, {})
   })
}

/**
 * To create sendEmail promise and handling the possible error
 *
 */
const createSendEmailPromise = (
   emailData: MailgunMessageData,
   reminder: ReminderData,
   stream: LiveStreamEventWithUsersLivestreamData,
   currentChunk: string
) => {
   const { id } = stream
   const { key } = reminder

   return sendMessage(emailData)
      .then(() => {
         return { reminderKey: key, streamId: id, chunk: currentChunk }
      })
      .catch((error) => {
         throw new Error(
            `Email ${key} with chunk ${currentChunk} was not sent for stream ${id} with the error ${error?.message}`
         )
      })
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
