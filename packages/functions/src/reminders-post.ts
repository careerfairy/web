import { FUNCTION_NAMES } from "@careerfairy/shared-lib/functions"
import {
   getAuthUidFromUserLivestreamData,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import { addUtmTagsToLink } from "@careerfairy/shared-lib/utils"
import { getHost } from "@careerfairy/shared-lib/utils/urls"
import { Timestamp } from "firebase-admin/firestore"
import * as functions from "firebase-functions"
import { onDocumentUpdated } from "firebase-functions/v2/firestore"
import { onRequest } from "firebase-functions/v2/https"
import { DateTime } from "luxon"
import functionsAxios from "./api/axios"
import { livestreamsRepo, notificationService } from "./api/repositories"
import { CUSTOMERIO_EMAIL_TEMPLATES } from "./lib/notifications/EmailTypes"
import { logAndThrow } from "./lib/validations"

// Magic numbers for reminder timing
const JOIN_REMINDER_DELAY_MINUTES = 7

/**
 * Schedules reminder emails for users who haven't joined a newly started livestream
 */
export const onLivestreamStartScheduleJoinReminders = onDocumentUpdated(
   {
      document: "livestreams/{livestreamId}",
      memory: "1GiB",
      timeoutSeconds: 60,
   },
   async (event) => {
      try {
         const previousValue = event.data.before.data() as LivestreamEvent
         const newValue = event.data.after.data() as LivestreamEvent
         const livestreamId = event.params.livestreamId

         // Only proceed if livestream has just started and it's not a test
         if (
            !previousValue.hasStarted &&
            newValue.hasStarted
            // !newValue.test
         ) {
            functions.logger.info(
               `Livestream ${livestreamId} has started, checking if reminder task already exists`
            )

            // Check if a reminder task already exists for this livestream
            const taskExists = await livestreamsRepo.checkReminderTaskExists(
               livestreamId
            )

            if (taskExists) {
               functions.logger.info(
                  `Reminder task already exists for livestream ${livestreamId}, skipping reminder function`
               )
               return null
            }

            functions.logger.info(
               `No existing reminder task for livestream ${livestreamId}, triggering reminder function`
            )

            // Call the HTTP function that will handle the waiting and sending
            const response = await functionsAxios.post(
               `/${FUNCTION_NAMES.sendLivestreamNoShowReminderWithDelay}`,
               { livestreamId }
            )

            if (response.status !== 200) {
               throw new Error(
                  `Failed to trigger reminder function: ${response.statusText}`
               )
            }

            functions.logger.info(
               `Successfully triggered reminder function for livestream ${livestreamId}`
            )
         }

         return null
      } catch (error) {
         logAndThrow("Error triggering reminder function", error, event.data)
      }
   }
)

/**
 * HTTP function that waits for 7 minutes and then sends reminder emails
 * to users who registered for a livestream but haven't joined yet.
 */
export const sendLivestreamNoShowReminderWithDelay = onRequest(
   {
      memory: "1GiB",
      timeoutSeconds: 3600, // 1 hour timeout (Gen2 functions support up to 1 hour)
   },
   async (req, res) => {
      const { livestreamId } = req.body || {}
      try {
         if (!livestreamId) {
            res.status(400).send("Missing livestreamId in request body")
            return
         }

         functions.logger.info(
            `Waiting ${JOIN_REMINDER_DELAY_MINUTES} minutes before sending reminders for livestream ${livestreamId}`
         )

         // Store info that the reminder is scheduled
         const now = DateTime.now()
         const scheduledFor = now.plus({ minutes: JOIN_REMINDER_DELAY_MINUTES })

         await livestreamsRepo.createReminderTask(
            livestreamId,
            Timestamp.fromDate(scheduledFor.toJSDate())
         )

         // Wait for the specified minutes
         await new Promise((resolve) =>
            setTimeout(resolve, JOIN_REMINDER_DELAY_MINUTES * 60 * 1000)
         )

         functions.logger.info(
            `Processing ${JOIN_REMINDER_DELAY_MINUTES}-minute reminder for livestream ${livestreamId}`
         )

         // Get the livestream data
         const livestream = await livestreamsRepo.getById(livestreamId)

         if (!livestream) {
            res.status(404).send(`Livestream ${livestreamId} not found`)
            return
         }

         // Filter out users who have already joined
         const usersToNotify = await livestreamsRepo.getLivestreamNoShowUsers(
            livestreamId
         )

         if (usersToNotify.length === 0) {
            functions.logger.log(
               `No users to notify for livestream ${livestreamId} - all registered users have joined`
            )

            // Mark the task as completed in Firestore
            await livestreamsRepo.updateReminderTask(
               livestreamId,
               CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_REMINDER_NO_SHOW,
               {
                  status: "completed",
                  completedAt: Timestamp.now(),
                  results: { successful: 0, failed: 0 },
               }
            )

            res.status(200).send("No users to notify")
            return
         }

         const livestreamUrl = addUtmTagsToLink({
            link: `${getHost()}/portal/livestream/${livestreamId}`,
            source: "careerfairy",
            medium: "email",
            content: livestream.title,
            campaign: "reminder-no-show",
         })

         // Send notification to each user
         const { successful, failed } =
            await notificationService.sendEmailNotifications(
               usersToNotify.map((data) => {
                  return {
                     templateId:
                        CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_REMINDER_NO_SHOW,
                     templateData: {
                        livestream: {
                           company: livestream.company || "",
                           bannerImageUrl: livestream.backgroundImageUrl || "",
                           companyLogoUrl: livestream.companyLogoUrl || "",
                           start: new Date(
                              livestream.start.toMillis()
                           ).toISOString(),
                           title: livestream.title || "Livestream Event",
                           url: livestreamUrl,
                           companyPageUrl: `${getHost()}/portal/companies/${
                              livestream.companyId || ""
                           }`,
                        },
                        speakers: [],
                        calendar: {
                           google: "",
                           outlook: "",
                           apple: "",
                        },
                     },
                     identifiers: {
                        id: getAuthUidFromUserLivestreamData(data),
                     },
                     to: data.user.userEmail,
                  }
               })
            )

         functions.logger.log(
            `${JOIN_REMINDER_DELAY_MINUTES}-minute reminder emails sent for livestream ${livestreamId}: ${successful} successful, ${failed} failed`
         )

         // Mark the task as completed in Firestore
         await livestreamsRepo.updateReminderTask(
            livestreamId,
            CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_REMINDER_NO_SHOW,
            {
               status: "completed",
               completedAt: Timestamp.now(),
               results: { successful, failed },
            }
         )

         res.status(200).send({
            message: "Reminder emails sent successfully",
            results: { successful, failed },
         })
      } catch (error) {
         functions.logger.error(
            `Error sending ${JOIN_REMINDER_DELAY_MINUTES}-minute reminder emails for livestream ${livestreamId}`,
            error
         )
         res.status(500).send(`Error sending reminder emails: ${error.message}`)
      }
   }
)
