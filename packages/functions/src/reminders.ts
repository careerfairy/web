import functions = require("firebase-functions")
import { client } from "./api/postmark"
import { admin } from "./api/firestoreAdmin"
import { addMinutesDate, generateReminderEmailData, setHeaders } from "./util"
import { sendMessage } from "./api/mailgun"
import { TemplatedMessage } from "postmark"
import { LiveStreamEventWithRegisteredStudents } from "@careerfairy/shared-lib/dist/livestreams"
import { MailgunMessageData } from "mailgun.js/interfaces/Messages"
import {
   getStreamsByDateWithRegisteredStudents,
   updateLiveStreamWithEmailSent,
} from "./lib/livestream"

export const sendReminderEmailToUserFromUniversity = functions.https.onRequest(
   async (req, res) => {
      console.log("running")

      setHeaders(req, res)

      const { groupId, categoryId, categoryValueId } = req.body

      const collectionRef = admin
         .firestore()
         .collection("userData")
         .where("groupIds", "array-contains", groupId)

      collectionRef
         .get()
         .then((querySnapshot) => {
            console.log("snapshotSize:" + querySnapshot.size)
            querySnapshot.forEach((doc) => {
               const userData = doc.data()
               const groupCategory = userData.registeredGroups.find(
                  (group) => group.groupId === groupId
               )
               if (groupCategory) {
                  const filteringCategory = groupCategory.categories.find(
                     (category) => category.id === categoryId
                  )
                  if (
                     filteringCategory &&
                     filteringCategory.selectedValueId === categoryValueId
                  ) {
                     console.log(userData.userEmail)
                     const email = {
                        TemplateId: req.body.templateId,
                        From: "CareerFairy <noreply@careerfairy.io>",
                        To: userData.userEmail,
                        TemplateModel: {
                           userEmail: userData.userEmail,
                        },
                     }
                     client.sendEmailWithTemplate(email).then(
                        () => {
                           console.log("email sent to: " + userData.userEmail)
                        },
                        (error) => {
                           console.log("error:" + error)
                        }
                     )
                  }
               }
            })
         })
         .catch((error) => {
            console.log("error:" + error)
            return res.status(400).send()
         })
   }
)

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
            application_link: data.application_link,
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

export type ReminderData = {
   template: string
   minutesBefore: number
   livestreamKey: string
}

const Reminder5Min: ReminderData = {
   template: "reminder-5-minutes",
   minutesBefore: 5,
   livestreamKey: "reminder5Minutes",
}

const Reminder1Hour: ReminderData = {
   template: "reminder-1-hour",
   minutesBefore: 60,
   livestreamKey: "reminder1Hour",
}

const Reminder24Hours: ReminderData = {
   template: "reminder-24-hours",
   minutesBefore: 1440,
   livestreamKey: "reminder24Hours",
}

/**
 * Runs every {reminderScheduleRange} minutes to handle all the 5 minutes, 1 hour and 1 day livestream email reminders
 * The {reminderDateDelay} is the number of minutes we want to delay in the future, to be sure that our logic runs before being required to send the reminders
 *
 * So we will be looking for streams that start on current date + {reminderDateDelay}
 */
export const scheduleReminderEmails = functions.pubsub
   .schedule("every 15 minutes")
   .timeZone("Europe/Zurich")
   .onRun((context) => {
      const dateStart = addMinutesDate(new Date(), reminderDateDelay)
      const dateEndFor5Minutes = addMinutesDate(
         dateStart,
         reminderScheduleRange
      )
      const reminder5MinutesPromise = handleReminder(
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
         dateStartFor24Hours,
         dateEndFor24Hours,
         Reminder24Hours
      )

      Promise.allSettled([
         reminder5MinutesPromise,
         reminder1HourPromise,
         reminder24HoursPromise,
      ]).then((results) => {
         const rejectedPromises = results.filter(
            ({ status }) => status === "rejected"
         )
         rejectedPromises.length &&
            functions.logger.error(
               `${rejectedPromises.length} reminders were not sent`
            )
      })
   })

/**
 * Search for a stream that will start between {filterStartDate} and {filterEndDate} + {reminderScheduleRange} minutes and schedule the reminder.
 *
 */
const handleReminder = async (
   filterStartDate: Date,
   filterEndDate: Date,
   reminder: ReminderData
) => {
   const streams = await getStreamsByDateWithRegisteredStudents(
      filterStartDate,
      filterEndDate
   )

   const { livestreamKey } = reminder

   const filteredStreams = filterAlreadySentEmail(streams, livestreamKey)

   functions.logger.log(
      `${filteredStreams.length} streams with ${livestreamKey} reminder`
   )

   await handleSendEmail(filteredStreams, reminder)
}

/**
 * It creates emailData based on the stream and the reminder information and sends the email to all the streams that are not FaceToFace.
 *
 */
const handleSendEmail = (
   streams: LiveStreamEventWithRegisteredStudents[],
   reminder: ReminderData
) => {
   const promiseArrayToSendMessages = []
   const { template, minutesBefore } = reminder

   streams.forEach((stream) => {
      const { isFaceToFace, company } = stream

      if (isFaceToFace) {
         functions.logger.log(
            `Livestream with ${company} is F2F, no reminder email sent out`
         )
      } else {
         const emailData = generateReminderEmailData(
            stream,
            template,
            minutesBefore
         )
         promiseArrayToSendMessages.push(
            createSendEmailPromise(emailData, reminder, stream)
         )
      }
   })

   return Promise.allSettled(promiseArrayToSendMessages).then((results) => {
      results.forEach((result: any) => {
         const { status, value, reason } = result

         if (status === "fulfilled") {
            const { template, streamId } = value
            functions.logger.log(
               `Email ${template} sent successfully for the stream ${streamId}`
            )
         } else {
            functions.logger.error(reason)
            throw Error(reason)
         }
      })
   })
}

/**
 * To create sendEmail promise and handling the possible error
 *
 */
const createSendEmailPromise = (
   emailData: MailgunMessageData,
   reminder: ReminderData,
   stream: LiveStreamEventWithRegisteredStudents
) => {
   const { id } = stream
   const { template } = reminder

   return sendMessage(emailData)
      .then(() => {
         return updateLiveStreamWithEmailSent(stream, reminder).then(() => {
            return { template, streamId: id }
         })
      })
      .catch((error) => {
         throw Error(
            `Email ${template} was not sent for stream ${id} with the error ${error}`
         )
      })
}

/**
 * To filter all the streams to the ones
 *
 */
const filterAlreadySentEmail = (
   streams: LiveStreamEventWithRegisteredStudents[],
   reminderKey: string
): LiveStreamEventWithRegisteredStudents[] => {
   return streams.filter((stream) => {
      const { reminderEmailsSent } = stream

      return reminderEmailsSent ? !reminderEmailsSent[reminderKey] : true
   })
}
