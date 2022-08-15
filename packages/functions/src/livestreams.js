const functions = require("firebase-functions")
const { admin } = require("./api/firestoreAdmin")
const { client } = require("./api/postmark")
const config = require("./config")
const {
   notifyLivestreamStarting,
   notifyLivestreamCreated,
} = require("./api/slack")

exports.assertLivestreamRegistrationWasCompleted = functions.firestore
   .document("livestreams/{livestreamId}/userLivestreamData/{studentId}")
   .onCreate((snapshot, context) => {
      console.log(
         `Documents created in userLivestreamData in ${context.params.livestreamId}`
      )
      if (snapshot.exists) {
         const data = snapshot.data()
         const userRegistered = Boolean(data?.registered?.date)
         if (!userRegistered) return
         admin
            .firestore()
            .collection("livestreams")
            .doc(context.params.livestreamId)
            .update({
               registeredUsers: admin.firestore.FieldValue.arrayUnion(
                  context.params.studentId
               ),
            })
            .then(() => {
               console.log(
                  `Successfully updated registeredUsers in ${context.params.livestreamId}`
               )
            })
      }
   })

exports.assertLivestreamDeregistrationWasCompleted = functions.firestore
   .document("livestreams/{livestreamId}/userLivestreamData/{studentId}")
   .onWrite((change, context) => {
      console.log(
         `Documents deleted in userLivestreamData in ${context.params.livestreamId}`
      )
      const snap = change.after
      const data = snap && snap.data()
      const userStillRegistered = Boolean(data?.registered?.date)

      if (userStillRegistered) return

      admin
         .firestore()
         .collection("livestreams")
         .doc(context.params.livestreamId)
         .update({
            registeredUsers: admin.firestore.FieldValue.arrayRemove(
               context.params.studentId
            ),
         })
         .then(() => {
            console.log(
               `Successfully removed user from registeredUsers in ${context.params.livestreamId}`
            )
         })
   })

exports.scheduleTestLivestreamDeletion = functions.pubsub
   .schedule("every sunday 09:00")
   .timeZone("Europe/Zurich")
   .onRun((context) => {
      admin
         .firestore()
         .collection("livestreams")
         .where("test", "==", true)
         .get()
         .then((querySnapshot) => {
            console.log("querysnapshot size: " + querySnapshot.size)
            querySnapshot.forEach((doc) => {
               admin
                  .firestore()
                  .collection("livestreams")
                  .doc(doc.id)
                  .delete()
                  .catch((e) => {
                     console.log(e)
                  })
            })
         })
   })

exports.sendLivestreamRegistrationConfirmationEmail = functions.https.onCall(
   async (data, context) => {
      //   const cal = ical({
      //      domain: "careerfairy.io",
      //      name: "Live Stream Invite",
      //   });
      //   const start = DateTime.fromJSDate(new Date(req.body.regular_date));

      //   cal.createEvent({
      //      start: start,
      //      end: start.plus({ minutes: 45 }),
      //      summary: `Live stream with ${req.body.company_name}`,
      //      description: req.body.livestream_title,
      //      location: "On CareerFairy",
      //      timezone: "Europe/Zurich",
      //      organizer: {
      //         name: "CareerFairy",
      //         mailto: "noreply@careerfairy.io",
      //      },
      //      url: req.body.livestream_link,
      //   });

      //   let calStr = cal.toString();
      //   let calBase64Str = Buffer.from(calStr).toString("base64");

      const email = {
         TemplateId:
            process.env.POSTMARK_TEMPLATE_LIVESTREAM_REGISTRATION_CONFIRMATION,
         From: "CareerFairy <noreply@careerfairy.io>",
         To: data.recipientEmail,
         TemplateModel: {
            user_first_name: data.user_first_name,
            livestream_date: data.livestream_date,
            company_name: data.company_name,
            company_logo_url: data.company_logo_url,
            livestream_title: data.livestream_title,
            livestream_link: data.livestream_link,
         },
         //  Attachments: [
         //     {
         //        Name: "livestream.ics",
         //        Content: calBase64Str,
         //        ContentType: "text/calendar; charset=utf-8; method=REQUEST",
         //     },
         //  ],
      }

      client.sendEmailWithTemplate(email).then(
         (response) => {
            return { status: 200 }
         },
         (error) => {
            console.log("error:" + error)
            return { status: 500, error: error }
         }
      )
   }
)

exports.sendPhysicalEventRegistrationConfirmationEmail = functions.https.onCall(
   async (data, context) => {
      const email = {
         TemplateId: process.env.POSTMARK_TEMPLATE_F2F_EVENT_REGISTRATION,
         From: "CareerFairy <noreply@careerfairy.io>",
         To: data.recipientEmail,
         TemplateModel: {
            user_first_name: data.user_first_name,
            event_date: data.event_date,
            company_name: data.company_name,
            company_logo_url: data.company_logo_url,
            event_title: data.event_title,
            event_address: data.event_address,
         },
      }

      client.sendEmailWithTemplate(email).then(
         (response) => {
            return { status: 200 }
         },
         (error) => {
            console.log("error:" + error)
            return { status: 500, error: error }
         }
      )
   }
)

exports.sendHybridEventRegistrationConfirmationEmail = functions.https.onCall(
   async (data, context) => {
      console.log("Starting")
      const email = {
         TemplateId:
            process.env
               .POSTMARK_TEMPLATE_HYBRID_EVENT_REGISTRATION_CONFIRMATION,
         From: "CareerFairy <noreply@careerfairy.io>",
         To: data.recipientEmail,
         TemplateModel: {
            user_first_name: data.user_first_name,
            event_date: data.event_date,
            company_name: data.company_name,
            company_logo_url: data.company_logo_url,
            event_title: data.event_title,
            event_address: data.event_address,
            livestream_link: data.livestream_link,
         },
      }

      client.sendEmailWithTemplate(email).then(
         (response) => {
            return { status: 200 }
         },
         (error) => {
            console.log("error:" + error)
            return { status: 500, error: error }
         }
      )
   }
)

exports.setFirstCommentOfQuestionOnCreate = functions.firestore
   .document("livestreams/{livestream}/questions/{question}/comments/{comment}")
   .onCreate(async (commentSnap) => {
      try {
         const commentData = commentSnap.data()
         const questionRef = commentSnap.ref.parent.parent
         const questionSnap = await questionRef.get()
         if (questionSnap.exists) {
            const questionData = questionSnap.data()
            let questionDataToUpdate = {
               numberOfComments: admin.firestore.FieldValue.increment(1),
            }
            if (!questionData.firstComment) {
               questionDataToUpdate.firstComment = commentData
            }
            const successMessage = questionData.firstComment
               ? "Question already has first comment, only increment"
               : `Updated question doc (${questionRef.path}) with new first comment`
            await questionRef.update(questionDataToUpdate)
            functions.logger.log(successMessage)
         } else {
            functions.logger.warn(
               `The question (${questionRef.path}) does not exist for comment ${commentSnap.ref.path}`
            )
         }
      } catch (e) {
         functions.logger.error("error in setFirstCommentOfQuestionOnCreate", e)
      }
   })

exports.notifySlackWhenALivestreamStarts = functions
   .region(config.region)
   .firestore.document("livestreams/{livestreamId}")
   .onUpdate(async (change, context) => {
      const previousValue = change.before.data()
      const newValue = change.after.data()

      if (!newValue.test && !previousValue.hasStarted && newValue.hasStarted) {
         functions.logger.log("Detected the livestream has started")
         const webhookUrl = config.slackWebhooks.livestreamAlerts

         // cancel notification if the event start date is more than 1h away than now
         if (Math.abs(Date.now() - newValue.start?.toMillis()) > 3600 * 1000) {
            functions.logger.log(
               "The livestream start date is too far from now, skipping the notification"
            )
            return
         }

         try {
            await notifyLivestreamStarting(webhookUrl, newValue)
         } catch (e) {
            functions.logger.error(
               "error in notifySlackWhenALivestreamStarts",
               e
            )
         }
      } else {
         functions.logger.log("The livestream has not started yet")
      }
   })

exports.notifySlackWhenALivestreamIsCreated = functions
   .region(config.region)
   .firestore.document("livestreams/{livestreamId}")
   .onCreate(async (snap, context) => {
      const event = snap.data()
      let publisherEmailOrName = event.author?.email

      if (event.test) {
         functions.logger.log(
            "The livestream is a test, skipping the notification"
         )
         return
      }

      // cancel notification if the event start date is more than 1w in the past
      // we create events in the past to test, we don't want to notify in that case
      const oneWeekMs = 7 * 24 * 3600 * 1000
      if (event.start?.toMillis() - Date.now() < -oneWeekMs) {
         functions.logger.log(
            "The livestream start date is more than 7 days in the past, skipping the notification"
         )
         return
      }

      try {
         // Fetch the author details
         if (publisherEmailOrName) {
            let userDoc = await admin
               .firestore()
               .collection("userData")
               .doc(publisherEmailOrName)
               .get()

            if (userDoc.exists) {
               const user = userDoc.data()
               publisherEmailOrName = `${user.firstName} ${user.lastName}`
            }
         }

         const webhookUrl = config.slackWebhooks.livestreamAlerts
         await notifyLivestreamCreated(webhookUrl, publisherEmailOrName, event)
      } catch (e) {
         functions.logger.error(
            "error in notifySlackWhenALivestreamIsCreated",
            e
         )
      }
   })
