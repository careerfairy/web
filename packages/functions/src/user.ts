import { onDocumentUpdated } from "firebase-functions/v2/firestore"
import { livestreamsRepo } from "./api/repositories"
import { logAndThrow } from "./lib/validations"
import { UserData } from "@careerfairy/shared-lib/users"
import * as functions from "firebase-functions"

/**
 * Triggered on Firestore user document updates to synchronize and update
 * the user's livestream data with the latest information.
 * Skips processing if no new data is provided.
 */
export const updateUserLiveStreamDataOnUserChange = onDocumentUpdated(
   {
      document: "userData/{userEmail}",
   },
   async (event) => {
      try {
         const newValue = event.data.after.data() as UserData

         // Skip because user has been deleted
         if (!newValue) {
            functions.logger.log(
               `Skipping because user ${event.params.userEmail} has been deleted`
            )
            return null
         }
         functions.logger.log(
            `Fetching all all userLivestreamDatas for user ${newValue.authId}...`
         )
         // Fetch all user live stream data
         const userLivestreamDatas =
            await livestreamsRepo.getUserLivestreamData(newValue.authId)

         functions.logger.log(
            `Successfully got ${userLivestreamDatas.length} userLivestreamDatas for user ${newValue.authId}, now updating...`
         )

         // Update all new user live stream data with fresh user data
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
            `Error synchronizing livestream data for user: ${event.params.userEmail}`,
            error,
            event.data
         )
      }
   }
)
