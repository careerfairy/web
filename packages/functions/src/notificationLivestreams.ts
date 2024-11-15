import { onDocumentUpdated } from "firebase-functions/v2/firestore"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { livestreamsRepo } from "./api/repositories"
import { logAndThrow } from "./lib/validations"
import * as functions from "firebase-functions"

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

         // Skip if it's a test live stream
         if (newValue.test) {
            return null
         }

         // Only proceed if live stream has just started
         if (!previousValue.hasStarted && newValue.hasStarted) {
            // Cancel notification if the event start date is more than 1h away from now
            if (
               Math.abs(Date.now() - newValue.start?.toMillis()) >
               3600 * 1000
            ) {
               functions.logger.log(
                  "The live stream start date is too far from now, skipping the notification"
               )
               return null
            }

            newValue.id = event.params.livestreamId
            return livestreamsRepo.createLivestreamStartPushNotifications(
               newValue
            )
         }

         return null
      } catch (error) {
         logAndThrow(
            "Error sending push notifications for live stream start",
            error,
            event.data
         )
      }
   }
)
