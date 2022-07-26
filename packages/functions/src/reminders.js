const functions = require("firebase-functions")
const {
   setHeaders,
   addMinutesDate,
   generateReminderEmailData,
} = require("./util")

const { sendMessage } = require("./api/mailgun")
const { client } = require("./api/postmark")
const { admin } = require("./api/firestoreAdmin")

exports.sendReminderEmailToUserFromUniversity = functions.https.onRequest(
   async (req, res) => {
      console.log("running")

      setHeaders(req, res)

      let counter = 0

      let groupId = req.body.groupId
      let categoryId = req.body.categoryId
      let categoryValueId = req.body.categoryValueId

      let collectionRef = admin
         .firestore()
         .collection("userData")
         .where("groupIds", "array-contains", groupId)

      collectionRef
         .get()
         .then((querySnapshot) => {
            console.log("snapshotSize:" + querySnapshot.size)
            querySnapshot.forEach((doc) => {
               var id = doc.id
               var userData = doc.data()
               let groupCategory = userData.registeredGroups.find(
                  (group) => group.groupId === groupId
               )
               if (groupCategory) {
                  let filteringCategory = groupCategory.categories.find(
                     (category) => category.id === categoryId
                  )
                  if (
                     filteringCategory &&
                     filteringCategory.selectedValueId === categoryValueId
                  ) {
                     console.log(userData.userEmail)
                     counter++
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

exports.sendReminderEmailToRegistrants = functions.https.onRequest(
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
            let testEmails = ["maximilian@careerfairy.io"]
            let templates = []
            registeredUsers.forEach((recipient) => {
               const email = {
                  TemplateId: req.body.templateId,
                  From: "CareerFairy <noreply@careerfairy.io>",
                  To: recipient,
                  TemplateModel: {},
               }
               templates.push(email)
            })
            let arraysOfTemplates = []
            for (index = 0; index < templates.length; index += 500) {
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

exports.sendReminderEmailAboutApplicationLink = functions
   .runWith({
      minInstances: 1,
   })
   .https.onCall(async (data, context) => {
      functions.logger.log("data", data)
      const email = {
         TemplateId:
            process.env.POSTMARK_TEMPLATE_REMINDER_JOB_POSTING_APPLICATION,
         From: "CareerFairy <noreply@careerfairy.io>",
         To: data.recipient,
         TemplateModel: {
            recipient_name: data.recipient_name,
            application_link: data.application_link,
            position_name: data.position_name,
         },
      }

      client.sendEmailWithTemplate(email).then(
         (response) => {
            functions.logger.log(`Sent reminder email to ${data.recipient}`)
         },
         (error) => {
            console.error(`Error sending email to ${data.recipient}`, error)
            throw new functions.https.HttpsError("unknown")
         }
      )
   })

// delay to be sure that the reminder is sent at the time
const reminderDateDelay = 20
const reminderDayToMinutes = 1440
const reminderHourToMinutes = 60
// range to how many minutes we will search
const reminderSchedulerTimer = 15

/**
 * Runs every 15 minutes to handle all the 5 minutes, 1 hour and 1 day livestream email reminders
 */
exports.scheduleReminderEmails = functions.pubsub
   .schedule("every 15 minutes")
   .timeZone("Europe/Zurich")
   .onRun(async (context) => {
      const dateStart = addMinutesDate(new Date(Date.now()), reminderDateDelay)

      await handle5MinutesReminder(dateStart)
      await handle1HourReminder(dateStart)
      await handle1DayReminder(dateStart)
   })

/**
 * Search for a stream that will start in the next {reminderSchedulerTimer} minutes and schedule a reminder for 5 minutes before it starts.
 *
 * @param {Date} dateStart
 * @returns {Promise<void>}
 */
const handle5MinutesReminder = async (dateStart) => {
   const dateEnd5Minutes = addMinutesDate(dateStart, reminderSchedulerTimer)

   try {
      const streamsToReminderIn5Minutes =
         await getStreamsByDateWithRegisteredStudents(
            dateStart,
            dateEnd5Minutes
         )

      functions.logger.log(
         `${streamsToReminderIn5Minutes.length} streams with 5 minutes reminder`
      )

      await handleSendEmail(
         streamsToReminderIn5Minutes,
         "reminder-5-minutes",
         5
      )
   } catch (error) {
      throw new functions.https.HttpsError(
         "unknown",
         "error on 5 minutes reminder: " + error
      )
   }
}

/**
 * Search for a stream that will start during 1 hour and 1 hour + {reminderSchedulerTimer} minutes and schedule a reminder for 1 hour before it starts.
 *
 * @param {Date} dateStart
 * @returns {Promise<void>}
 */
const handle1HourReminder = async (dateStart) => {
   const dateStart1Hour = addMinutesDate(dateStart, reminderHourToMinutes)
   const dateEnd1Hour = addMinutesDate(dateStart1Hour, reminderSchedulerTimer)

   try {
      const streamsToReminderIn1Hour =
         await getStreamsByDateWithRegisteredStudents(
            dateStart1Hour,
            dateEnd1Hour
         )

      functions.logger.log(
         `${streamsToReminderIn1Hour.length} streams with 1 hour reminder`
      )

      await handleSendEmail(
         streamsToReminderIn1Hour,
         "reminder-1-hour",
         reminderHourToMinutes
      )
   } catch (error) {
      throw new functions.https.HttpsError(
         "unknown",
         "error on 1 hour reminder: " + error
      )
   }
}

/**
 * Search for a stream that will start during 1 day and 1 day + {reminderSchedulerTimer} minutes and schedule a reminder for 1 day before it starts.
 *
 * @param {Date} dateStart
 * @returns {Promise<void>}
 */
const handle1DayReminder = async (dateStart) => {
   const dateStart1Day = addMinutesDate(dateStart, reminderDayToMinutes)
   const dateEnd1Day = addMinutesDate(dateStart1Day, reminderSchedulerTimer)

   try {
      const streamsToReminderIn1Day =
         await getStreamsByDateWithRegisteredStudents(
            dateStart1Day,
            dateEnd1Day
         )

      functions.logger.log(
         `${streamsToReminderIn1Day.length} streams with 1 day reminder`
      )

      await handleSendEmail(
         streamsToReminderIn1Day,
         "reminder-24-hours",
         reminderDayToMinutes
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
 * @param {Partial<LivestreamEvent>[]} streams
 * @param {string} emailTemplateId
 * @param {number} minutesToRemindBefore
 */
const handleSendEmail = (streams, emailTemplateId, minutesToRemindBefore) => {
   streams.forEach((stream) => {
      const { isFaceToFace, company } = stream

      if (!isFaceToFace) {
         const emailData = generateReminderEmailData(
            stream,
            emailTemplateId,
            minutesToRemindBefore
         )
         return sendMessage(emailData)
      } else {
         functions.logger.log(
            `Livestream with ${company} is F2F, no reminder email sent out`
         )
      }
   })
}

/**
 * Get all the streams filtered by starting date and with all the registered students for each stream.
 *
 * @param {Date} dateStart
 * @param {Date} dateEnd
 * @returns {Promise<object[] | void>}
 */
const getStreamsByDateWithRegisteredStudents = (dateStart, dateEnd) => {
   return admin
      .firestore()
      .collection("livestreams")
      .where("start", ">=", dateStart)
      .where("start", "<=", dateEnd)
      .get()
      .then(async (querySnapshot) => {
         const streams = querySnapshot.docs?.map((doc) => ({
            id: doc.id,
            ...doc.data(),
         }))

         return await addRegisteredStudentsFieldOnStreams(streams)
      })
      .catch((error) => console.log(error))
}

/**
 * Add all registered students to the correspondent streams
 *
 * @param {Partial<LivestreamEvent>[]} streams
 * @returns {Promise<*[]>}
 */
const addRegisteredStudentsFieldOnStreams = async (streams = []) => {
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
