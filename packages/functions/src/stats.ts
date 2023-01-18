import functions = require("firebase-functions")
import { UserLivestreamData } from "@careerfairy/shared-lib/dist/livestreams"
import { isEmpty } from "lodash"
import {
   addOperationWithBooleanCheck,
   addOperationWithNumberCheck,
   OperationsToMake,
} from "./lib/stats"
import { livestreamsRepo } from "./api/repositories"
import { getPropertyToUpdate } from "@careerfairy/shared-lib/dist/livestreams/stats"

/*
 * The `updateLiveStreamStats` function listens for changes in the `userLivestreamData` subcollection of the `livestreams` collection,
 * and updates a `stats` subcollection document named `livestreamStats`.
 *
 * The function uses the `change.before.data()` and `change.after.data()`
 * to get the old and new data of the modified document respectively. It uses `addOperations()` function to check which fields of the newData and
 * oldData are different and updates the livestreamStatsToUpdate accordingly.
 *
 * The function also checks if the university code has been changed, if it has, the function decrements the old university data and increments the new university data.
 * In the end, it checks if there are any updates to livestreamStats, if there are updates, it performs a Firestore transaction to update liveStreamStats and logs a message to indicate the
 * livestreamStats have been updated.
 * */
export const updateLiveStreamStats = functions.firestore
   .document("livestreams/{livestreamId}/userLivestreamData/{userId}")
   .onWrite(async (change, context) => {
      const { livestreamId } = context.params

      const oldUserLivestreamData = change.before.data() as UserLivestreamData
      const newUserLivestreamData = change.after.data() as UserLivestreamData

      const livestreamStatsDocOperationsToMake: OperationsToMake = {} // An empty object to store the update operations for the firestore UPDATE operation

      // Add operations for the general stats
      addOperations(
         newUserLivestreamData,
         oldUserLivestreamData,
         livestreamStatsDocOperationsToMake
      )

      const newUniversityCode = newUserLivestreamData?.user?.university?.code
      const oldUniversityCode = oldUserLivestreamData?.user?.university?.code

      // Check if the university code has been changed
      const universityChanged = newUniversityCode !== oldUniversityCode

      if (universityChanged) {
         if (oldUniversityCode) {
            // Decrement all the truthy fields of the oldUserLivestreamData
            addOperationsToDecrementOldUniversityStats(
               oldUniversityCode,
               oldUserLivestreamData,
               livestreamStatsDocOperationsToMake
            )
         }

         if (newUniversityCode) {
            // Increment all the truthy fields of newUserLivestreamData like participated.date, registered.date, talentPool.date, etc...
            addOperationsToIncrementNewUniversityStats(
               newUniversityCode,
               newUserLivestreamData,
               livestreamStatsDocOperationsToMake
            )
         }
      } else {
         // If the university code has not been changed, then increment/decrement the fields that have changed for the user's university
         addOperations(
            newUserLivestreamData,
            oldUserLivestreamData,
            livestreamStatsDocOperationsToMake,
            newUniversityCode
         )
      }

      // Check if there are any updates to livestreamStats
      if (isEmpty(livestreamStatsDocOperationsToMake)) {
         functions.logger.info("No changes to livestream stats", {
            livestreamId,
            liveStreamStatsToUpdate: livestreamStatsDocOperationsToMake,
         })
      } else {
         // Perform a Firestore transaction to update livestreamStats
         await livestreamsRepo.updateLiveStreamStats(
            livestreamId,
            livestreamStatsDocOperationsToMake
         )

         functions.logger.info(
            "Updated livestream stats with the following operations",
            {
               livestreamId,
               livestreamStatsDocOperationsToMake,
            }
         )
      }
   })

/**
 * This function checks which fields of the newData and oldData are different and updates the operationsToMakeObject accordingly.
 * If the universityCode argument is provided, the function will only update the operationsToMakeObject for the universityCode provided.
 *
 * @param newData The new data of the document
 * @param oldData The old data of the document
 * @param operationsToMakeObject The object that will be updated with the operations to make
 * @param universityCode The university code to update the operationsToMakeObject for
 * */
const addOperations = (
   newData: UserLivestreamData,
   oldData: UserLivestreamData,
   operationsToMakeObject: OperationsToMake,
   universityCode?: string
) => {
   addOperationWithBooleanCheck(
      Boolean(newData?.participated?.date),
      Boolean(oldData?.participated?.date),
      operationsToMakeObject,
      getPropertyToUpdate("numberOfParticipants", universityCode)
   )

   // Check if the user has registered
   addOperationWithBooleanCheck(
      Boolean(newData?.registered?.date),
      Boolean(oldData?.registered?.date),
      operationsToMakeObject,
      getPropertyToUpdate("numberOfRegistrations", universityCode)
   )

   // Check if the user talent pool status has changed
   addOperationWithBooleanCheck(
      Boolean(newData?.talentPool?.date),
      Boolean(oldData?.talentPool?.date),
      operationsToMakeObject,
      getPropertyToUpdate("numberOfTalentPoolProfiles", universityCode)
   )

   addOperationWithNumberCheck(
      Object.keys(newData?.jobApplications || {}).length,
      Object.keys(oldData?.jobApplications || {}).length,
      operationsToMakeObject,
      getPropertyToUpdate("numberOfApplicants", universityCode)
   )
}

const addOperationsToDecrementOldUniversityStats = (
   oldUniversityCode: string,
   oldUserLivestreamData: UserLivestreamData,
   operationsToMakeObject: OperationsToMake
) => {
   // Since the function is only decrementing the fields, it uses null as the new data argument,
   // and oldUserLivestreamData as the old data argument. This way the function will decrement all
   // the fields that are truthy in the old data but not in the new data, which in this case is null.
   addOperations(
      null,
      oldUserLivestreamData,
      operationsToMakeObject,
      oldUniversityCode
   )
}

const addOperationsToIncrementNewUniversityStats = (
   newUniversityCode: string,
   newUserLivestreamData: UserLivestreamData,
   operationsToMakeObject: OperationsToMake
) => {
   // Since the function is only incrementing the fields, it uses newUserLivestreamData as the new data argument,
   // and null as the old data argument. This way the function will increment all the fields that are truthy in
   // the new data but not in the old data, which in this case is null.
   addOperations(
      newUserLivestreamData,
      null,
      operationsToMakeObject,
      newUniversityCode
   )
}
