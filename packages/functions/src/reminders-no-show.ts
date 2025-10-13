import { FUNCTION_NAMES } from "@careerfairy/shared-lib/functions"
import {
   getAuthUidFromUserLivestreamData,
   LivestreamEvent,
   UserLivestreamData,
} from "@careerfairy/shared-lib/livestreams"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { Timestamp } from "firebase-admin/firestore"
import * as functions from "firebase-functions"
import { onDocumentUpdated } from "firebase-functions/v2/firestore"
import { onRequest } from "firebase-functions/v2/https"
import { DateTime } from "luxon"
import functionsAxios from "./api/axios"
import {
   groupRepo,
   livestreamsRepo,
   notificationService,
} from "./api/repositories"
import {
   CUSTOMERIO_EMAIL_TEMPLATES,
   NoShowReminderTemplateData,
   PanelNoShowReminderTemplateData,
} from "./lib/notifications/EmailTypes"
import { logAndThrow } from "./lib/validations"
import { formatLivestreamDate, getWebBaseUrl } from "./util"

// Magic numbers for reminder timing
const JOIN_REMINDER_DELAY_MINUTES = 5

/**
 * Schedules reminder emails for users who haven't joined a newly started livestream
 */
export const onLivestreamStartScheduleNoShowReminder = onDocumentUpdated(
   "livestreams/{livestreamId}",
   async (event) => {
      try {
         const previousValue = event.data.before.data() as LivestreamEvent
         const newValue = event.data.after.data() as LivestreamEvent
         const livestreamId = event.params.livestreamId

         // Only proceed if livestream has just started and it's not a test
         if (
            !previousValue.hasStarted &&
            newValue.hasStarted &&
            !newValue.test
         ) {
            functions.logger.info(
               `Livestream ${livestreamId} has started, checking if reminder task already exists`
            )

            const reminderTaskId =
               newValue?.livestreamType === "panel" || newValue?.isPanel
                  ? CUSTOMERIO_EMAIL_TEMPLATES.PANEL_REMINDER_NO_SHOW
                  : CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_REMINDER_NO_SHOW
            // Check if a reminder task already exists for this livestream
            const task = await livestreamsRepo.getReminderTask(
               livestreamId,
               reminderTaskId
            )

            if (task) {
               functions.logger.info(
                  `Reminder task already exists for livestream ${livestreamId}, skipping reminder function`
               )
               return null
            }

            functions.logger.info(
               `No existing reminder task for livestream ${livestreamId}, triggering reminder function`
            )

            // Call the HTTP function that will handle the waiting and sending
            void functionsAxios.post(
               `/${FUNCTION_NAMES.sendLivestreamNoShowReminder}`,
               { livestreamId }
            )

            functions.logger.info(
               `Triggered reminder function for livestream ${livestreamId}`
            )
         }

         return null
      } catch (error) {
         logAndThrow("Error triggering reminder function", error, event.data)
      }
   }
)

/**
 * HTTP function that waits for 5 minutes and then sends reminder emails
 * to users who registered for a livestream but haven't joined yet.
 */
export const sendLivestreamNoShowReminder = onRequest(
   {
      timeoutSeconds: 3600, // 1 hour timeout (Gen2 functions support up to 1 hour)
   },
   async (req, res) => {
      const { livestreamId } = req.body || {}
      try {
         if (!livestreamId) {
            res.status(400).send("Missing livestreamId in request body")
            return
         }

         let templateId:
            | typeof CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_REMINDER_NO_SHOW
            | typeof CUSTOMERIO_EMAIL_TEMPLATES.PANEL_REMINDER_NO_SHOW =
            CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_REMINDER_NO_SHOW

         // Get the livestream data
         const livestream = await livestreamsRepo.getById(livestreamId)

         if (livestream?.livestreamType === "panel" || livestream?.isPanel) {
            functions.logger.info(
               `Livestream ${livestreamId} is a panel, using panel reminder template`
            )
            templateId = CUSTOMERIO_EMAIL_TEMPLATES.PANEL_REMINDER_NO_SHOW
         }

         // Check if a reminder task already exists for this livestream
         const existingTask = await livestreamsRepo.getReminderTask(
            livestreamId,
            templateId
         )

         if (existingTask) {
            functions.logger.info(
               `Reminder task already exists for livestream ${livestreamId} to be sent in ${existingTask.scheduledFor
                  .toDate()
                  .toLocaleString()}, skipping reminder function`
            )
            res.status(200).send("Reminder task already exists")
            return
         }

         functions.logger.info(
            `Waiting ${JOIN_REMINDER_DELAY_MINUTES} minutes before sending reminders for livestream ${livestreamId}`
         )

         // Store info that the reminder is scheduled
         const now = DateTime.now()
         const scheduledFor = now.plus({ minutes: JOIN_REMINDER_DELAY_MINUTES })

         await livestreamsRepo.createReminderTask(livestreamId, {
            scheduledFor: Timestamp.fromDate(scheduledFor.toJSDate()),
            reminderTaskId: templateId,
         })

         // Wait for the specified minutes
         await new Promise((resolve) =>
            setTimeout(resolve, JOIN_REMINDER_DELAY_MINUTES * 60 * 1000)
         )

         functions.logger.info(
            `Processing ${JOIN_REMINDER_DELAY_MINUTES}-minute reminder for livestream ${livestreamId}`
         )

         if (!livestream) {
            res.status(404).send(`Livestream ${livestreamId} not found`)
            return
         }

         const livestreamPresenter =
            LivestreamPresenter.createFromDocument(livestream)

         if (!livestreamPresenter.isLive()) {
            functions.logger.info(
               `Livestream ${livestreamId} is not live, cancelling reminder task`
            )

            await livestreamsRepo.updateReminderTask(livestreamId, templateId, {
               status: "cancelled",
               cancelledAt: Timestamp.now(),
            })

            res.status(200).send(
               "Livestream is not live, cancelling reminder task"
            )
            return
         }

         // Filter out users who have already joined
         const usersToNotify = await livestreamsRepo.getLivestreamNoShowUsers(
            livestreamId
         )

         if (!usersToNotify) {
            functions.logger.log(
               `No users to notify for livestream ${livestreamId} - all registered users have joined`
            )

            // Mark the task as completed in Firestore
            await livestreamsRepo.updateReminderTask(livestreamId, templateId, {
               status: "completed",
               completedAt: Timestamp.now(),
               results: { successful: 0, failed: 0 },
            })

            res.status(200).send("No users to notify")
            return
         }

         const livestreamUrl = `${getWebBaseUrl()}/portal/livestream/${livestreamId}`

         let companyPageUrl = ""
         const companyNames = []

         if (livestream.livestreamType === "panel" || livestream.isPanel) {
            const groups = await groupRepo.getGroupsByIds(livestream.groupIds)

            for (const group of groups) {
               if (
                  group.publicProfile &&
                  group.id === livestream.groupIds.at(0)
               ) {
                  companyPageUrl = group.careerPageUrl
               }

               companyNames.push(group.universityName)
            }
         }

         // Send notification to each user
         const { successful, failed } =
            await notificationService.sendEmailNotifications(
               usersToNotify.map((data) => {
                  const templateData =
                     templateId ===
                     CUSTOMERIO_EMAIL_TEMPLATES.PANEL_REMINDER_NO_SHOW
                        ? buildPanelNoShowTemplateData(
                             livestream,
                             data,
                             livestreamUrl,
                             companyNames,
                             companyPageUrl
                          )
                        : buildLivestreamNoShowTemplateData(
                             livestream,
                             livestreamUrl
                          )

                  return {
                     templateId,
                     templateData,
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
         await livestreamsRepo.updateReminderTask(livestreamId, templateId, {
            status: "completed",
            completedAt: Timestamp.now(),
            results: { successful, failed },
         })

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

// Template data builders
const buildLivestreamNoShowTemplateData = (
   livestream: LivestreamEvent,
   livestreamUrl: string
): NoShowReminderTemplateData => ({
   livestream: {
      company: livestream.company,
      companyLogoUrl: livestream.companyLogoUrl,
      title: livestream.title,
      url: livestreamUrl,
   },
   speaker1: {
      firstName: livestream.speakers?.[0]?.firstName || "",
   },
   speaker2: {
      firstName: livestream.speakers?.[1]?.firstName || "",
   },
})

const buildPanelNoShowTemplateData = (
   livestream: LivestreamEvent,
   userLivestreamData: UserLivestreamData,
   livestreamUrl: string,
   companyNames: string[],
   companyPageUrl: string
): PanelNoShowReminderTemplateData => ({
   panel: {
      companyLogoUrl: livestream.companyLogoUrl,
      title: livestream.title,
      url: livestreamUrl,
      bannerImageUrl: livestream.backgroundImageUrl,
      start: formatLivestreamDate(
         livestream.start.toDate(),
         userLivestreamData.user.timezone || "Europe/Zurich"
      ),
      companyPageUrl: companyPageUrl,
   },
   speakers: livestream.speakers
      ?.filter?.((speaker) => speaker.position !== "Moderator")
      ?.map((speaker) => ({
         firstName: speaker.firstName,
      })),
   companies: companyNames,
})
