import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import {
   addUtmTagsToLink,
   getLivestreamICSDownloadUrl,
} from "@careerfairy/shared-lib/utils"
import * as functions from "firebase-functions"
import { client } from "./api/postmark"
import { notifyLivestreamCreated, notifyLivestreamStarting } from "./api/slack"
import config from "./config"
import { getWebBaseUrl, isLocalEnvironment, setCORSHeaders } from "./util"
// @ts-ignore (required when building the project inside docker)
import { generateCalendarEventProperties } from "@careerfairy/shared-lib/utils/calendarEvents"
import { logger } from "firebase-functions/v2"
import {
   onDocumentCreated,
   onDocumentUpdated,
} from "firebase-functions/v2/firestore"
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https"
import ical from "ical-generator"
import { firestore } from "./api/firestoreAdmin"
import {
   customJobRepo,
   groupRepo,
   livestreamsRepo,
   notificationService,
   sparkRepo,
   userRepo,
} from "./api/repositories"
import {
   formatLivestreamStartDate,
   prepareEmailJobs,
   prepareEmailSparks,
   prepareEmailSpeakers,
} from "./lib/email/helpers"
import {
   CUSTOMERIO_EMAIL_TEMPLATES,
   EmailAttachment,
} from "./lib/notifications/EmailTypes"

export const getLivestreamICalendarEvent = onRequest(async (req, res) => {
   setCORSHeaders(req, res)
   const livestreamId = req.query.eventId as string
   const campaign = req.query.utm_campaign as string
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
            const calendarEventProperties = generateCalendarEventProperties(
               livestream,
               campaign
                  ? {
                       campaign,
                    }
                  : undefined
            )

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

export const livestreamRegistrationConfirmationEmail = onCall(
   async (request) => {
      logger.info("🚀 ~ Livestream registration confirmation email: v6.0")
      const host = request.rawRequest.headers.origin || "https://careerfairy.io"
      const userAuthId = request.auth?.uid
      // Fetch the live stream data
      const livestream = await livestreamsRepo.getById(
         request.data.livestream_id
      )

      if (!livestream) {
         logger.error("Livestream not found")
         return {
            status: 404,
            message: "Livestream not found",
         }
      }

      const eventGroups = await groupRepo.getGroupsByIds(livestream.groupIds)

      const groupWithoutUniCode = eventGroups.find(
         (group) => !group.universityCode
      )
      const group = groupWithoutUniCode ?? eventGroups.at(0)

      const livestreamJobs = livestream.hasJobs
         ? (await customJobRepo.getCustomJobsByLivestreamId(livestream.id)) ??
           []
         : []
      const groupSparks = group.publicSparks
         ? (await sparkRepo.getPublishedSparksByGroupId(group.id)) ?? []
         : []

      const emailSpeakers = prepareEmailSpeakers(
         livestream,
         host,
         "eventRegistration"
      )

      const emailJobs = prepareEmailJobs(
         livestream,
         host,
         livestreamJobs,
         "eventRegistration"
      )

      const emailSparks = prepareEmailSparks(
         groupSparks,
         livestream,
         host,
         "eventRegistration"
      )

      // Generate ICS file content
      const cal = ical()

      const calendarEventProperties = generateCalendarEventProperties(
         livestream,
         {
            campaign: "fromcalendarevent-mail",
         }
      )

      cal.createEvent(calendarEventProperties)

      const icsContent = cal.toString()

      const emailCalendar = {
         google: request.data.eventCalendarUrls.google,
         outlook: request.data.eventCalendarUrls.outlook,
         apple: getLivestreamICSDownloadUrl(
            livestream.id,
            isLocalEnvironment(),
            {
               utmCampaign: "fromcalendarevent-mail",
            }
         ),
      }

      const formattedStartDate = formatLivestreamStartDate(
         livestream,
         request.data.user_time_zone
      )

      const attachments: EmailAttachment[] = [
         {
            filename: `${livestream.title.replace(/[^a-z0-9]/gi, "_")}.ics`,
            content: icsContent,
         },
      ]

      try {
         // Send email using notification repository
         const result = await notificationService.sendEmailNotifications([
            {
               templateId: CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_REGISTRATION,
               templateData: {
                  livestream: {
                     title: livestream.title,
                     company: group.universityName,
                     start: formattedStartDate,
                     companyBannerImageUrl:
                        livestream.backgroundImageUrl || group.bannerImageUrl,
                  },
                  jobs: emailJobs,
                  speakers: emailSpeakers,
                  sparks: emailSparks,
                  calendar: emailCalendar,
               },
               identifiers: {
                  id: userAuthId,
               },
               to: request.data.recipientEmail,
               attachments,
            },
         ])

         logger.info(
            "🚀 ~ Livestream registration confirmation email sent",
            result
         )
         return {
            status: 200,
            data: "Livestream registration confirmation email sent",
         }
      } catch (error) {
         logger.error("Error sending registration confirmation email", error)
         return { status: 500, error: error }
      }
   }
)

export const sendPhysicalEventRegistrationConfirmationEmail = onCall<{
   userUid: string
   livestreamId: string
}>(async (request) => {
   const livestream = await livestreamsRepo.getById(request.data.livestreamId)
   const user = await userRepo.getUserDataByUid(request.data.userUid)

   if (!livestream) {
      logger.error("Livestream not found")
      throw new HttpsError("not-found", "Livestream not found")
   }

   if (!user) {
      logger.error("User not found")
      throw new HttpsError("not-found", "User not found")
   }

   const eventGroups = await groupRepo.getGroupsByIds(livestream.groupIds)

   const groupWithoutUniCode = eventGroups.find(
      (group) => !group.universityCode
   )
   const group = groupWithoutUniCode ?? eventGroups.at(0)

   const livestreamJobs = livestream.hasJobs
      ? (await customJobRepo.getCustomJobsByLivestreamId(livestream.id)) ?? []
      : []
   const groupSparks = group.publicSparks
      ? (await sparkRepo.getPublishedSparksByGroupId(group.id)) ?? []
      : []

   const host = request.rawRequest.headers.origin || getWebBaseUrl()

   const emailSpeakers = prepareEmailSpeakers(
      livestream,
      host,
      "eventRegistration"
   )

   const emailJobs = prepareEmailJobs(
      livestream,
      host,
      livestreamJobs,
      "eventRegistration"
   )

   const emailSparks = prepareEmailSparks(
      groupSparks,
      livestream,
      host,
      "eventRegistration"
   )

   const formattedStartDate = formatLivestreamStartDate(
      livestream,
      user.timezone
   )

   return notificationService.sendEmailNotification({
      templateId: CUSTOMERIO_EMAIL_TEMPLATES.LIVE_STREAM_REGISTRATION_F2F,
      templateData: {
         livestream: {
            title: livestream.title,
            company: livestream.company,
            start: formattedStartDate,
            companyBannerImageUrl: group.bannerImageUrl,
            eventAddress: livestream.address,
         },
         jobs: emailJobs,
         speakers: emailSpeakers,
         sparks: emailSparks,
      },
      to: user.userEmail,
      identifiers: {
         id: user.authId,
      },
   })
})

export const sendHybridEventRegistrationConfirmationEmail = onCall(
   async ({ data }) => {
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
   }
)

export const notifySlackWhenALivestreamStarts = onDocumentUpdated(
   "livestreams/{livestreamId}",
   async (event) => {
      const previousValue = event.data.before.data()
      const newValue = event.data.after.data()

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
   }
)

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
