import * as functions from "firebase-functions"
import { admin } from "./api/firestoreAdmin"
import { client } from "./api/postmark"
import config from "./config"
import { notifyLivestreamStarting, notifyLivestreamCreated } from "./api/slack"
import { setCORSHeaders, isLocalEnvironment } from "./util"
import ical from "ical-generator"
import { addUtmTagsToLink } from "@careerfairy/shared-lib/utils"
import { DateTime } from "luxon"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"

export const getLivestreamICalendarEvent = functions
   .region(config.region)
   .https.onRequest(async (req, res) => {
      setCORSHeaders(req, res)
      const livestreamId = req.query.eventId as string

      if (livestreamId) {
         try {
            // get the livestream
            const querySnapshot = await admin
               .firestore()
               .collection("livestreams")
               .doc(livestreamId)
               .get()

            if (querySnapshot.exists) {
               const livestream = querySnapshot.data() as LivestreamEvent

               const livestreamTimeZone = livestream.timezone || "Europe/Zurich"

               // create calendar event
               const livestreamStartDate = DateTime.fromJSDate(
                  livestream.start.toDate(),
                  { zone: livestreamTimeZone }
               )

               const linkWithUTM = addUtmTagsToLink({
                  link: `https://careerfairy.io/upcoming-livestream/${livestreamId}`,
                  campaign: "fromCalendarEvent",
               })

               const cal = ical({
                  events: [
                     {
                        start: livestreamStartDate,
                        end: livestreamStartDate.plus({
                           minutes: livestream.duration || 45,
                        }),
                        location: `${linkWithUTM}`,
                        summary: livestream.title,
                        description: "Join the event now!",
                        organizer: {
                           name: "CareerFairy",
                           email: "noreply@careerfairy.io",
                        },
                        url: linkWithUTM,
                        timezone: livestreamTimeZone,
                     },
                  ],
               })
               cal.serve(res)
            }
         } catch (e) {
            functions.logger.warn(
               `An error has occurred creating the ICalendar event from the livestream ${livestreamId}`
            )
            res.sendStatus(500)
         }
      }
   })

export const sendLivestreamRegistrationConfirmationEmail = functions
   .region(config.region)
   .https.onCall(async (data) => {
      const email: any = {
         TemplateId:
            process.env.POSTMARK_TEMPLATE_LIVESTREAM_REGISTRATION_CONFIRMATION,
         From: "CareerFairy <noreply@careerfairy.io>",
         To: data.recipientEmail,
         TemplateModel: {
            user_first_name: data.user_first_name,
            livestream_date: data.livestream_date,
            company_name: data.company_name,
            company_logo_url: data.company_logo_url,
            company_background_image_url: data.company_background_image_url,
            livestream_title: data.livestream_title,
            livestream_link: addUtmTagsToLink({
               link: data.livestream_link,
               campaign: "eventRegistration",
               content: data.livestream_title,
            }),
            next_livestreams_link: addUtmTagsToLink({
               link: "https://careerfairy.io/next-livestreams",
               campaign: "eventRegistration",
               content: data.livestream_title,
            }),
            calendar_event_i_calendar: isLocalEnvironment()
               ? `http://localhost:5001/careerfairy-e1fd9/europe-west1/getLivestreamICalendarEvent_eu_v2?eventId=${data.livestream_id}`
               : `https://europe-west1-careerfairy-e1fd9.cloudfunctions.net/getLivestreamICalendarEvent_eu_v2?eventId=${data.livestream_id}`,
            calendar_event_google: data.eventCalendarUrls.google,
            calendar_event_outlook: data.eventCalendarUrls.outlook,
            calendar_event_yahoo: data.eventCalendarUrls.yahoo,
         },
      }

      client.sendEmailWithTemplate(email).then(
         () => {
            return { status: 200 }
         },
         (error) => {
            console.log("error:" + error)
            return { status: 500, error: error }
         }
      )
   })

export const sendPhysicalEventRegistrationConfirmationEmail = functions
   .region(config.region)
   .https.onCall(async (data) => {
      const email: any = {
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
         () => {
            return { status: 200 }
         },
         (error) => {
            console.log("error:" + error)
            return { status: 500, error: error }
         }
      )
   })

export const sendHybridEventRegistrationConfirmationEmail = functions
   .region(config.region)
   .https.onCall(async (data) => {
      console.log("Starting")
      const email: any = {
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
            livestream_link: addUtmTagsToLink({
               link: data.livestream_link,
               campaign: "eventRegistration",
               content: data.livestream_title,
            }),
            next_livestreams_link: addUtmTagsToLink({
               link: "https://careerfairy.io/next-livestreams",
               campaign: "eventRegistration",
               content: data.livestream_title,
            }),
         },
      }

      client.sendEmailWithTemplate(email).then(
         () => {
            return { status: 200 }
         },
         (error) => {
            console.log("error:" + error)
            return { status: 500, error: error }
         }
      )
   })

export const setFirstCommentOfQuestionOnCreate = functions.firestore
   .document("livestreams/{livestream}/questions/{question}/comments/{comment}")
   .onCreate(async (commentSnap) => {
      try {
         const commentData = commentSnap.data()
         const questionRef = commentSnap.ref.parent.parent
         const questionSnap = await questionRef.get()
         if (questionSnap.exists) {
            const questionData = questionSnap.data()
            const questionDataToUpdate: any = {
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

export const notifySlackWhenALivestreamStarts = functions
   .region(config.region)
   .firestore.document("livestreams/{livestreamId}")
   .onUpdate(async (change) => {
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

export const notifySlackWhenALivestreamIsCreated = functions
   .region(config.region)
   .firestore.document("livestreams/{livestreamId}")
   .onCreate(async (snap) => {
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
            const userDoc = await admin
               .firestore()
               .collection("userData")
               .doc(publisherEmailOrName)
               .get()

            if (userDoc.exists) {
               const user = userDoc.data()
               publisherEmailOrName = `${user.firstName} ${user.lastName}`
            }
         }

         const webhookUrl = config.slackWebhooks.livestreamCreated
         await notifyLivestreamCreated(webhookUrl, publisherEmailOrName, event)
      } catch (e) {
         functions.logger.error(
            "error in notifySlackWhenALivestreamIsCreated",
            e
         )
      }
   })
