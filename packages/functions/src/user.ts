import { onDocumentUpdated } from "firebase-functions/v2/firestore"
import { livestreamsRepo } from "./api/repositories"
import { logAndThrow } from "./lib/validations"
import { UserData } from "@careerfairy/shared-lib/users"
import * as functions from "firebase-functions"

/**
 * Sends push notifications to registered users when a live stream starts
 */
export const syncUserLivestreamData = onDocumentUpdated(
   {
      document: "userData/{userEmail}",
   },
   async (event) => {
      try {
         const newValue = event.data.after.data() as UserData

         // Skip if it's a test live stream
         if (!newValue) {
            functions.logger.log("Skipping because no user data is provided...")
            return null
         }
         functions.logger.log(
            `Fetching all all userLivestreamDatas for user ${newValue.authId}...`
         )
         // Fetch all user livestream data
         const userLivestreamDatas =
            await livestreamsRepo.getUserLivestreamData(newValue.authId)

         functions.logger.log(
            `Successfully got ${userLivestreamDatas.length} userLivestreamDatas for user ${newValue.authId}, now updating...`
         )

         // Update all new user livestream data with fresh user data
         await livestreamsRepo.updateUserLivestreamData(
            newValue,
            userLivestreamDatas
         )

         functions.logger.log(
            `${userLivestreamDatas.length} userLivestreamDatas updated successfully for user id: ${newValue.authId}`
         )

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
