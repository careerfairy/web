import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import {
   addUtmTagsToLink,
   companyNameSlugify,
   getLivestreamICSDownloadUrl,
} from "@careerfairy/shared-lib/utils"
import * as functions from "firebase-functions"
import { client } from "./api/postmark"
import { notifyLivestreamCreated, notifyLivestreamStarting } from "./api/slack"
import config from "./config"
import { isLocalEnvironment, setCORSHeaders } from "./util"
// @ts-ignore (required when building the project inside docker)
import { TagValuesLookup } from "@careerfairy/shared-lib/constants/tags"
import { SparkInteractionSources } from "@careerfairy/shared-lib/sparks/telemetry"
import { generateCalendarEventProperties } from "@careerfairy/shared-lib/utils/calendarEvents"
import { logger } from "firebase-functions/v2"
import { onDocumentCreated } from "firebase-functions/v2/firestore"
import ical from "ical-generator"
import { DateTime } from "luxon"
import { firestore } from "./api/firestoreAdmin"
import { customJobRepo, groupRepo, sparkRepo } from "./api/repositories"

export const getLivestreamICalendarEvent = functions
   .region(config.region)
   .https.onRequest(async (req, res) => {
      setCORSHeaders(req, res)
      const livestreamId = req.query.eventId as string

      if (livestreamId) {
         try {
            // get the live stream
            const querySnapshot = await firestore
               .collection("livestreams")
               .doc(livestreamId)
               .get()

            if (querySnapshot.exists) {
               const livestream = querySnapshot.data() as LivestreamEvent

               // create calendar event
               const calendarEventProperties =
                  generateCalendarEventProperties(livestream)

               const cal = ical({
                  events: [calendarEventProperties],
               })
               cal.serve(res)
            } else {
               res.status(404).send("Live stream not found")
            }
         } catch (e) {
            functions.logger.warn(
               `An error has occurred creating the ICalendar event from the live stream ${livestreamId}`,
               e
            )
            res.sendStatus(500)
         }
      } else {
         res.status(400).send("Missing eventId parameter")
      }
   })

export const sendLivestreamRegistrationConfirmationEmail = functions
   .region(config.region)
   .https.onCall(async (data) => {
      // Fetch the live stream data
      const livestreamDoc = await firestore
         .collection("livestreams")
         .doc(data.livestream_id)
         .get()
      const livestream = livestreamDoc.data() as LivestreamEvent

      // Generate ICS file content
      const cal = ical()

      const calendarEventProperties =
         generateCalendarEventProperties(livestream)

      cal.createEvent(calendarEventProperties)

      const icsContent = cal.toString()

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
            calendar_event_i_calendar: getLivestreamICSDownloadUrl(
               data.livestream_id,
               isLocalEnvironment()
            ),
            calendar_event_google: data.eventCalendarUrls.google,
            calendar_event_outlook: data.eventCalendarUrls.outlook,
            calendar_event_yahoo: data.eventCalendarUrls.yahoo,
         },
         Attachments: [
            {
               // Replace any character that is not alphanumeric with an underscore
               Name: `${livestream.title.replace(/[^a-z0-9]/gi, "_")}.ics`,
               Content: Buffer.from(icsContent).toString("base64"),
               ContentType: "text/calendar",
            },
         ],
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

export const livestreamRegistrationConfirmationEmail = functions
   .region(config.region)
   .https.onCall(async (data, context) => {
      logger.info("🚀 ~ Livestream registration confirmation email: v4.0")
      const host =
         context?.rawRequest?.headers?.origin || "https://careerfairy.io"
      // Fetch the live stream data
      const livestreamDoc = await firestore
         .collection("livestreams")
         .doc(data.livestream_id)
         .get()
      const livestream = livestreamDoc.data() as LivestreamEvent

      const group = await groupRepo.getGroupById(livestream.groupIds.at(0))

      const livestreamSpeakers = livestream.speakers ?? []
      const livestreamJobs = livestream.hasJobs
         ? (await customJobRepo.getCustomJobsByLivestreamId(livestream.id)) ??
           []
         : []
      const groupSparks = group.publicSparks
         ? (await sparkRepo.getSparksByGroupId(livestream.groupIds.at(0))) ?? []
         : []

      const emailSpeakers = livestreamSpeakers.slice(0, 4).map((speaker) => {
         return {
            name: `${speaker.firstName} ${speaker.lastName}`,
            position: speaker.position,
            avatarUrl: speaker.avatar,
            url: addUtmTagsToLink({
               link: `${host}/portal/livestream/${livestream.id}/speaker-details/${speaker.id}`,
               source: "careerfairy",
               medium: "email",
               campaign: "eventRegistration",
               content: data.livestream_title,
            }),
         }
      })

      const emailJobs = livestreamJobs.slice(0, 5).map((job) => {
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
               link: `${host}/portal/livestream/${livestream.id}/job-details/${job.id}`,
               source: "careerfairy",
               medium: "email",
               campaign: "eventRegistration",
               content: data.livestream_title,
            }),
         }
      })

      const emailSparks = groupSparks
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
                     group.universityName
                  )}&groupId=${group.id}&interactionSource=${
                     SparkInteractionSources.RegistrationEmail
                  }`,
                  source: "careerfairy",
                  medium: "email",
                  campaign: "eventRegistration",
                  content: data.livestream_title,
               }),
            }
         })

      // Generate ICS file content
      const cal = ical()

      const calendarEventProperties =
         generateCalendarEventProperties(livestream)

      cal.createEvent(calendarEventProperties)

      const icsContent = cal.toString()

      const emailCalendar = {
         google: data.eventCalendarUrls.google,
         outlook: data.eventCalendarUrls.outlook,
         apple: getLivestreamICSDownloadUrl(
            data.livestream_id,
            isLocalEnvironment()
         ),
      }

      const livestreamStartDate = DateTime.fromJSDate(
         livestream.start.toDate(),
         {
            zone: data.user_time_zone || "Europe/Zurich",
         }
      )

      const formattedStartDate = livestreamStartDate.toFormat(
         "dd LLLL yyyy 'at' hh:mm a '(GMT' Z')'"
      )

      const email: any = {
         TemplateId:
            process.env.POSTMARK_TEMPLATE_LIVESTREAM_REGISTRATION_CONFIRMATION,
         From: "CareerFairy <noreply@careerfairy.io>",
         To: data.recipientEmail,
         TemplateModel: {
            livestream: {
               title: livestream.title,
               company: group.universityName,
               start: formattedStartDate,
               companyBannerImageUrl: group.bannerImageUrl,
            },
            user: {
               firstName: data.user_first_name,
            },
            jobs: emailJobs,
            speakers: emailSpeakers,
            sparks: emailSparks,
            calendar: emailCalendar,
         },
         Attachments: [
            {
               // Replace any character that is not alphanumeric with an underscore
               Name: `${livestream.title.replace(/[^a-z0-9]/gi, "_")}.ics`,
               Content: Buffer.from(icsContent).toString("base64"),
               ContentType: "text/calendar",
            },
         ],
      }

      // Not awaiting on purpose, as it was this way and I believe to make the registration dialog go by quicker
      client.sendEmailWithTemplate(email).then(
         () => {
            logger.info("🚀 ~ Livestream registration confirmation email sent")
            return {
               status: 200,
               data: "Livestream registration confirmation email sent",
            }
         },
         (error) => {
            logger.error("Error sending registration confirmation email", error)
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

export const notifySlackWhenALivestreamIsCreated = onDocumentCreated(
   "livestreams/{livestreamId}",
   async (event) => {
      const livestream = {
         ...event.data.data(),
         id: event.params.livestreamId,
      } as LivestreamEvent

      if (!livestream) {
         logger.warn("No data associated with the event")
         return
      }

      let publisherEmailOrName = livestream.author?.email

      if (livestream.test) {
         logger.log("The live stream is a test, skipping the notification")
         return
      }

      // cancel notification if the event start date is more than 1w in the past
      // we create events in the past to test, we don't want to notify in that case
      const oneWeekMs = 7 * 24 * 3600 * 1000
      if (livestream.start?.toMillis() - Date.now() < -oneWeekMs) {
         logger.log(
            "The live stream start date is more than 7 days in the past, skipping the notification"
         )
         return
      }

      try {
         // Fetch the author details
         if (publisherEmailOrName) {
            const userDoc = await firestore
               .collection("userData")
               .doc(publisherEmailOrName)
               .get()

            if (userDoc.exists) {
               const user = userDoc.data()
               publisherEmailOrName = `${user.firstName} ${user.lastName}`
            }
         }

         const webhookUrl = config.slackWebhooks.livestreamCreated
         await notifyLivestreamCreated(
            webhookUrl,
            publisherEmailOrName,
            livestream
         )
      } catch (e) {
         logger.error("error in notifySlackWhenALivestreamIsCreated", e)
      }
   }
)
