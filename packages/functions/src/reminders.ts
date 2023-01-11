import functions = require("firebase-functions")
import config = require("./config")
import { client } from "./api/postmark"
import { admin } from "./api/firestoreAdmin"
import {
   addMinutesDate,
   generateNonAttendeesReminder,
   generateReminderEmailData,
   IGenerateEmailDataProps,
   setHeaders,
} from "./util"
import { sendMessage } from "./api/mailgun"
import { TemplatedMessage } from "postmark"
import {
   LivestreamEvent,
   LiveStreamEventWithUsersLivestreamData,
   UserLivestreamData,
} from "@careerfairy/shared-lib/dist/livestreams"
import { MailgunMessageData } from "mailgun.js/interfaces/Messages"
import {
   getStreamsByDateWithRegisteredStudents,
   updateLiveStreamsWithEmailSent,
} from "./lib/livestream"
import { addUtmTagsToLink } from "@careerfairy/shared-lib/dist/utils"

export const sendReminderEmailToRegistrants = functions.https.onRequest(
   async (req, res) => {
      setHeaders(req, res)

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
                  (response) => {
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
   }
)

export const sendReminderEmailAboutApplicationLink = functions
   .runWith({
      minInstances: 1,
   })
   .https.onCall(async (data, context) => {
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
      | "reminderNextDayMorning"
   template: string
}

const Reminder5Min: ReminderData = {
   template: "variable_message_title",
   timeMessage: "NOW",
   minutesBefore: 5,
   key: "reminder5Minutes",
}

const Reminder1Hour: ReminderData = {
   template: "variable_message_title",
   timeMessage: "in 1 hour",
   minutesBefore: 60,
   key: "reminder1Hour",
}

const Reminder24Hours: ReminderData = {
   template: "variable_message_title",
   timeMessage: "TOMORROW",
   minutesBefore: 1440,
   key: "reminder24Hours",
}

const ReminderNextDayMorning: ReminderData = {
   template: "reminder_for_recording",
   key: "reminderNextDayMorning",
}

/**
 * Runs every {reminderScheduleRange} minutes to handle all the 5 minutes, 1 hour and 1 day livestream email reminders
 * The {reminderDateDelay} is the number of minutes we want to delay in the future, to be sure that our logic runs before being required to send the reminders
 *
 * So we will be looking for streams that start on current date + {reminderDateDelay}
 */
export const scheduleReminderEmails = functions
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
 * When a livestreams ends we should schedule a reminder for the next day at 11 AM to all the non attendees
 */
exports.sendReminderToNonAttendeesWhenLivestreamsEnds = functions
   .region(config.region)
   .firestore.document("livestreams/{livestreamId}")
   .onUpdate(async (change) => {
      const previousValue = change.before.data() as LivestreamEvent
      const newValue = change.after.data() as LivestreamEvent

      if (
         !newValue.test &&
         previousValue.hasStarted &&
         !previousValue.hasEnded &&
         !newValue.hasStarted &&
         newValue.hasEnded
      ) {
         functions.logger.log("Detected the livestream has ended")

         try {
            const querySnapshot = await admin
               .firestore()
               .collectionGroup("userLivestreamData")
               .where("livestreamId", "==", newValue.id)
               .where("registered", "==", null)
               .where("participated", "!=", null)
               .get()

            if (!querySnapshot.empty) {
               // get all the non attendees users
               const nonAttendeesUsers = querySnapshot.docs?.map(
                  (doc) => doc.data() as UserLivestreamData
               )

               // join the stream info with all the non attendees
               const livestreamWithNonAttendees = {
                  ...(newValue as LivestreamEvent),
                  usersLivestreamData:
                     nonAttendeesUsers as UserLivestreamData[],
               } as LiveStreamEventWithUsersLivestreamData

               await handleSendEmail(
                  [livestreamWithNonAttendees],
                  ReminderNextDayMorning,
                  generateNonAttendeesReminder
               )
            }
         } catch (error) {
            functions.logger.error(
               "error in sending reminder to non attendees when livestreams ends",
               error
            )
            throw new functions.https.HttpsError("unknown", error)
         }
      } else {
         functions.logger.log("The livestream has not ended yet")
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
            minutesBefore,
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
