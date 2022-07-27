import functions = require("firebase-functions")
import { client } from "./api/postmark"
import { admin } from "./api/firestoreAdmin"
import { addMinutesDate, generateReminderEmailData, setHeaders } from "./util"
import { sendMessage } from "./api/mailgun"
import { TemplatedMessage } from "postmark"
import { LivestreamEvent } from "../.packages/shared-lib/dist/livestreams"
import { LiveStreamEventWithRegisteredStudents } from "@careerfairy/shared-lib/dist/livestreams"
import { MailgunMessageData } from "mailgun.js/interfaces/Messages"

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
const DAY_TO_MINUTES = 1440
const HOUR_TO_MINUTES = 60
// range to how many minutes we will search
const reminderScheduleRange = 15

const REMINDERS = {
   reminder5Minutes: "reminder-5-minutes",
   reminder1Hour: "reminder-1-hour",
   reminder24Hours: "reminder-24-hours",
}

/**
 * Runs every {reminderScheduleRange} minutes to handle all the 5 minutes, 1 hour and 1 day livestream email reminders
 * The {reminderDateDelay} is the number of minutes we want to delay in the future, to be sure that our logic runs before being required to send the reminders
 *
 * So we will be looking for streams that start on current date + {reminderDateDelay}
 */
export const scheduleReminderEmails = functions.pubsub
   .schedule(`every ${reminderScheduleRange} minutes`)
   .timeZone("Europe/Zurich")
   .onRun((context) => {
      retryReminders(handle5MinutesReminder).catch((error) => {
         throw new functions.https.HttpsError(
            "unknown",
            "error on 5 minutes reminder: " + error
         )
      })

      retryReminders(handle1HourReminder).catch((error) => {
         throw new functions.https.HttpsError(
            "unknown",
            "error on 1 hour reminder: " + error
         )
      })

      retryReminders(handle1DayReminder).catch((error) => {
         throw new functions.https.HttpsError(
            "unknown",
            "error on 1 day reminder: " + error
         )
      })
   })

/**
 * To retry 3 times send reminder emails in case of failure
 */
const retryReminders = async (fn) => {
   const timesToRetrySendReminder = 3

   for (let i = 0; i < timesToRetrySendReminder; i++) {
      const dateStart = addMinutesDate(new Date(), reminderDateDelay)

      functions.logger.log(`Check live streams started at ${dateStart}`)

      try {
         return await fn(dateStart)
      } catch {
         // It waits 500 ms to try again the failed send reminder
         await wait(500)
         functions.logger.error("failed to send reminder")
      }
   }

   throw new functions.https.HttpsError(
      "unknown",
      `Failed retrying ${timesToRetrySendReminder} times`
   )
}

/**
 * Simple wait
 *
 */
const wait = (ms) =>
   new Promise<void>((resolve) => {
      setTimeout(() => resolve(), ms)
   })

/**
 * Search for a stream that will start between {reminderDateDelay} and {reminderDateDelay} + {reminderScheduleRange} minutes and schedule a reminder for 5 minutes before it starts.
 *
 */
const handle5MinutesReminder = async (filterStartDate: Date) => {
   const filterEndDateFor5MinutesReminder = addMinutesDate(
      filterStartDate,
      reminderScheduleRange
   )

   try {
      const streamsToReminderIn5Minutes =
         await getStreamsByDateWithRegisteredStudents(
            filterStartDate,
            filterEndDateFor5MinutesReminder
         )

      const filteredStreams = filterAlreadySentEmail(
         streamsToReminderIn5Minutes,
         REMINDERS.reminder5Minutes
      )

      functions.logger.log(
         `${filteredStreams.length} streams with 5 minutes reminder`
      )

      await handleSendEmail(filteredStreams, REMINDERS.reminder5Minutes, 5)
   } catch (error) {
      throw new functions.https.HttpsError(
         "unknown",
         "error on 5 minutes reminder: " + error
      )
   }
}

/**
 * Search for a stream that will start between {reminderDateDelay} + 1 hour and {reminderDateDelay} + 1 hour + {reminderScheduleRange} minutes and schedule a reminder for 1 hour before it starts.
 *
 */
const handle1HourReminder = async (filterStartDate: Date): Promise<void> => {
   const filterStartDateFor1HourReminder = addMinutesDate(
      filterStartDate,
      HOUR_TO_MINUTES
   )
   const filterEndDateFor1HourReminder = addMinutesDate(
      filterStartDateFor1HourReminder,
      reminderScheduleRange
   )

   try {
      const streamsToReminderIn1Hour =
         await getStreamsByDateWithRegisteredStudents(
            filterStartDateFor1HourReminder,
            filterEndDateFor1HourReminder
         )

      const filteredStreams = filterAlreadySentEmail(
         streamsToReminderIn1Hour,
         REMINDERS.reminder1Hour
      )

      functions.logger.log(
         `${filteredStreams.length} streams with 1 hour reminder`
      )

      await handleSendEmail(
         filteredStreams,
         REMINDERS.reminder1Hour,
         HOUR_TO_MINUTES
      )
   } catch (error) {
      throw new functions.https.HttpsError(
         "unknown",
         "error on 1 hour reminder: " + error
      )
   }
}

/**
 * Search for a stream that will start between {reminderDateDelay} + 1 day and {reminderDateDelay} + 1 day + {reminderScheduleRange} minutes and schedule a reminder for 1 day before it starts.
 *
 */
const handle1DayReminder = async (filterStartDate: Date): Promise<void> => {
   const filterStartDateFor1DayReminder = addMinutesDate(
      filterStartDate,
      DAY_TO_MINUTES
   )
   const filterEndDateFor1DayReminder = addMinutesDate(
      filterStartDateFor1DayReminder,
      reminderScheduleRange
   )

   try {
      const streamsToReminderIn1Day =
         await getStreamsByDateWithRegisteredStudents(
            filterStartDateFor1DayReminder,
            filterEndDateFor1DayReminder
         )

      const filteredStreams = filterAlreadySentEmail(
         streamsToReminderIn1Day,
         REMINDERS.reminder24Hours
      )

      functions.logger.log(
         `${filteredStreams.length} streams with 1 day reminder`
      )

      await handleSendEmail(
         filteredStreams,
         REMINDERS.reminder24Hours,
         DAY_TO_MINUTES
      )
   } catch (error) {
      throw new functions.https.HttpsError(
         "unknown",
         "error on 1 day reminder: " + error
      )
   }
}

/**
 * It creates email data and sends the email to all the streams that are not FaceToFace.
 *
 */
const handleSendEmail = (
   streams: LiveStreamEventWithRegisteredStudents[],
   emailTemplateId: string,
   minutesToRemindBefore: number
) => {
   const promiseArrayToSendMessages = []

   streams.forEach((stream) => {
      const { isFaceToFace, company } = stream

      if (isFaceToFace) {
         functions.logger.log(
            `Livestream with ${company} is F2F, no reminder email sent out`
         )
      } else {
         const emailData = generateReminderEmailData(
            stream,
            emailTemplateId,
            minutesToRemindBefore
         )
         promiseArrayToSendMessages.push(
            createSendEmailPromise(emailData, emailTemplateId, stream)
         )
      }
   })

   return Promise.all(promiseArrayToSendMessages)
}

const createSendEmailPromise = (
   emailData: MailgunMessageData,
   emailTemplateId: string,
   stream: LiveStreamEventWithRegisteredStudents
) => {
   const { company } = stream

   return new Promise(() => {
      return sendMessage(emailData)
         .then(() => {
            functions.logger.log(
               `Reminders ${emailTemplateId} to company ${company} were sent successfully`
            )

            updateLiveStreamWithEmailSent(stream, emailTemplateId)
         })
         .catch(() => {
            functions.logger.error(
               `Reminders ${emailTemplateId} to company ${company} were not sent`
            )
         })
   })
}

/**
 * Get all the streams filtered by starting date and with all the registered students for each stream.
 *
 */
const getStreamsByDateWithRegisteredStudents = (
   filterStartDate: Date,
   filterEndDate: Date
): Promise<LiveStreamEventWithRegisteredStudents[]> => {
   return admin
      .firestore()
      .collection("livestreams")
      .where("start", ">=", filterStartDate)
      .where("start", "<=", filterEndDate)
      .get()
      .then((querySnapshot) => {
         const streams = querySnapshot.docs?.map(
            (doc) =>
               ({
                  id: doc.id,
                  ...doc.data(),
               } as LivestreamEvent)
         )

         return addRegisteredStudentsFieldOnStreams(streams)
      })
      .catch((error) => {
         throw new functions.https.HttpsError(
            "unknown",
            "error fetching streams : " + error
         )
      })
}

/**
 * Add all registered students to the correspondent streams
 *
 */
const addRegisteredStudentsFieldOnStreams = async (
   streams: LivestreamEvent[] = []
): Promise<LiveStreamEventWithRegisteredStudents[]> => {
   const formattedStreams = []
   for (const stream of streams) {
      const collection = await admin
         .firestore()
         .collection("livestreams")
         .doc(stream.id)
         .collection("registeredStudents")
         .get()

      const registeredStudents = collection.docs?.map((doc) => doc.data())
      formattedStreams.push({ ...stream, registeredStudents })
   }

   return formattedStreams
}

/**
 * Update {reminderEmailsSent} value on livestream DB with the specific reminder email that was sent
 *
 */
const updateLiveStreamWithEmailSent = (
   stream: LiveStreamEventWithRegisteredStudents,
   templateId: string
) => {
   const { id, reminderEmailsSent } = stream

   const reminderKey = getReminderKey(templateId)

   const fieldToUpdate = {
      ...reminderEmailsSent,
      [reminderKey]: true,
   }

   admin
      .firestore()
      .collection("livestreams")
      .doc(id)
      .update({ reminderEmailsSent: fieldToUpdate })
      .then(() => {
         functions.logger.log(
            `Reminders ${templateId} updated on stream ${id} data`
         )
      })
}

/**
 * To filter all the streams to the ones
 *
 */
const filterAlreadySentEmail = (
   streams: LiveStreamEventWithRegisteredStudents[],
   templateId: string
): LiveStreamEventWithRegisteredStudents[] => {
   return streams.filter((stream) => {
      const { reminderEmailsSent } = stream

      const reminderKey = getReminderKey(templateId)

      return reminderEmailsSent ? !reminderEmailsSent[reminderKey] : true
   })
}

const getReminderKey = (templateId: string) => {
   return Object.keys(REMINDERS).find((key) => REMINDERS[key] === templateId)
}
