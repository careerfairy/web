import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { addUtmTagsToLink } from "@careerfairy/shared-lib/utils"
import { getHost } from "@careerfairy/shared-lib/utils/urls"
import * as functions from "firebase-functions"
import { onDocumentUpdated } from "firebase-functions/v2/firestore"
import { livestreamsRepo, notificationRepo } from "./api/repositories"
import { CUSTOMERIO_PUSH_TEMPLATES } from "./lib/notifications/PushNotificationTypes"
import { logAndThrow } from "./lib/validations"

/**
 * Sends push notifications to registered users when a live stream starts
 */
export const notifyUsersWhenLivestreamStarts = onDocumentUpdated(
   {
      document: "livestreams/{livestreamId}",
      memory: "1GiB", // Increased memory for Expo SDK
      timeoutSeconds: 540, // Increased for larger batches
   },
   async (event) => {
      try {
         const previousValue = event.data.before.data() as LivestreamEvent
         const newValue = event.data.after.data() as LivestreamEvent

         // Only proceed if live stream has just started
         if (hasLivestreamStarted(previousValue, newValue)) {
            newValue.id = event.params.livestreamId

            await livestreamsRepo.createLivestreamStartPushNotifications(
               newValue
            )
         }
      } catch (error) {
         logAndThrow(
            "Error sending push notifications for live stream start",
            error,
            event.data
         )
      }
   }
)

export const notifyUsersOnLivestreamStart = onDocumentUpdated(
   {
      document: "livestreams/{livestreamId}",
      memory: "1GiB", // Increased memory for Customer.io API
      timeoutSeconds: 540, // Increased for larger batches
   },
   async (event) => {
      try {
         const previousValue = event.data.before.data() as LivestreamEvent
         const newValue = event.data.after.data() as LivestreamEvent

         // Only proceed if live stream has just started
         if (hasLivestreamStarted(previousValue, newValue)) {
            newValue.id = event.params.livestreamId

            const livestream = newValue

            const registeredUsers = await livestreamsRepo.getLivestreamUsers(
               newValue.id,
               "registered"
            )

            if (registeredUsers.length === 0) {
               functions.logger.log(
                  "No registered users found for live stream ${livestream.id} - skipping notifications"
               )
               return
            }

            const livestreamUrl = addUtmTagsToLink({
               link: `${getHost()}/portal/livestream/${livestream.id}`,
               source: "careerfairy",
               medium: "push",
               content: livestream.title,
               campaign: "livestream_start",
            })

            const { successful, failed } =
               await notificationRepo.sendPushNotifications(
                  registeredUsers.map((user) => ({
                     userAuthId: user.user?.authId,
                     templateType:
                        CUSTOMERIO_PUSH_TEMPLATES.LIVESTREAM_START.type,
                     templateData: {
                        live_stream_title: livestream.title,
                        company_logo_url: livestream.companyLogoUrl,
                        url: livestreamUrl,
                     },
                  }))
               )

            functions.logger.log(
               `Notifications sent: ${successful} successful, ${failed} failed`
            )
         }

         return null
      } catch (error) {
         functions.logger.error(
            "Error sending push notifications for live stream start",
            error
         )
      }
   }
)

const hasLivestreamStarted = (
   previousValue: LivestreamEvent,
   newValue: LivestreamEvent
) => {
   // Skip if it's a test live stream
   if (newValue.test) {
      return false
   }

   // Only proceed if live stream has just started
   if (!previousValue.hasStarted && newValue.hasStarted) {
      // Cancel notification if the event start date is more than 1h away from now
      if (Math.abs(Date.now() - newValue.start?.toMillis()) > 3600 * 1000) {
         functions.logger.log(
            "The live stream start date is too far from now, skipping the notification"
         )
         return false
      }

      return true
   }

   return false
}
