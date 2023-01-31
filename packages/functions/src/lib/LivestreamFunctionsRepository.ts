import {
   FirebaseLivestreamRepository,
   ILivestreamRepository,
} from "@careerfairy/shared-lib/livestreams/LivestreamRepository"
import {
   LivestreamEvent,
   UserLivestreamData,
} from "@careerfairy/shared-lib/livestreams"
import {
   getPopularityPoints,
   PopularityEventData,
} from "@careerfairy/shared-lib/livestreams/popularity"
import type { OperationsToMake } from "./stats/util"
import * as functions from "firebase-functions"
import {
   createLiveStreamStatsDoc,
   LiveStreamStats,
} from "@careerfairy/shared-lib/livestreams/stats"
import type { Change } from "firebase-functions"
import { firestore } from "firebase-admin"
import { isEmpty } from "lodash"
import {
   addOperations,
   addOperationsToDecrementOldUniversityStats,
   addOperationsToIncrementNewUniversityStats,
} from "./stats/livestream"
import DocumentSnapshot = firestore.DocumentSnapshot
import FieldValue = firestore.FieldValue
import type { FunctionsLogger } from "../util"

export interface ILivestreamFunctionsRepository extends ILivestreamRepository {
   /**
    * Get all registered users for the given livestream ids
    * @param livestreamIds
    */
   getRegisteredUsersMultipleEvents(
      livestreamIds: string[]
   ): Promise<UserLivestreamData[]>

   /**
    * Get all the Non Attendees users for a specific livestream
    * @param livestreamId
    */
   getNonAttendees(livestreamId: string): Promise<UserLivestreamData[]>

   updateLiveStreamStats(
      livestreamId: string,
      operationsToMake: OperationsToMake
   ): Promise<void>

   syncLiveStreamStatsWithLivestream(
      snapshotChange: Change<DocumentSnapshot>
   ): Promise<void>

   /*
    * The `updateLiveStreamStats` function listens for changes in the `userLivestreamData` subcollection of the `livestreams` collection,
    * and updates a `stats` subcollection document named `livestreamStats`.
    *
    * The function uses the `change.before.data()` and `change.after.data()`
    * to get the old and new data of the modified document respectively. It uses `addOperations()` function to check which fields of the newData and
    * oldData are different and updates the livestreamStatsToUpdate accordingly.
    *
    * The function also checks if the university code has been changed, if it has, the function decrements the old university data and increments the new university data.
    * In the end, it checks if there are any updates to livestreamStats, if there are updates, it performs a Firestore transaction to update livestreamStats and logs a message to indicate the
    * livestreamStats have been updated.
    * */
   addOperationsToLiveStreamStats(
      change: Change<DocumentSnapshot>,
      livestreamId: string,
      logger: FunctionsLogger
   ): Promise<void>

   /**
    * Update the livestream popularity field when a popularity event is created/deleted
    */
   updateLivestreamPopularity(
      popularityDoc: PopularityEventData,
      deleted?: boolean
   ): Promise<void>
}

export class LivestreamFunctionsRepository
   extends FirebaseLivestreamRepository
   implements ILivestreamFunctionsRepository
{
   updateLivestreamPopularity(
      popularityDoc: PopularityEventData,
      deleted = false
   ): Promise<void> {
      const livestreamRef = this.firestore
         .collection("livestreams")
         .doc(popularityDoc.livestreamId)

      let points = getPopularityPoints(popularityDoc)

      if (deleted) {
         // negative to decrease
         points *= -1
      }

      functions.logger.info(
         `Increasing livestream popularity by ${points} points.`
      )

      return livestreamRef.update({
         popularity: FieldValue.increment(points),
      })
   }

   async getRegisteredUsersMultipleEvents(
      livestreamIds: string[]
   ): Promise<UserLivestreamData[]> {
      const promises: Promise<UserLivestreamData[]>[] = []

      for (const livestreamId of livestreamIds) {
         promises.push(this.getLivestreamUsers(livestreamId, "registered"))
      }

      const promiseResults = await Promise.allSettled(promises)

      // map the promises responses into a single array
      return (
         promiseResults
            .map((result) => {
               if (result.status === "fulfilled") {
                  return result.value
               } else {
                  console.warn(
                     "Failed to get the UserLivestreamData promise",
                     result.reason
                  )
                  // best effort, ignore the failed ones for now
                  return null
               }
            })
            // remove nulls
            .filter((user) => user)
            .flatMap((array) => array)
      )
   }

   async getNonAttendees(livestreamId: string): Promise<UserLivestreamData[]> {
      const querySnapshot = await this.firestore
         .collectionGroup("userLivestreamData")
         .where("livestreamId", "==", livestreamId)
         .where("registered", "!=", null)
         .where("participated", "==", null)
         .get()

      if (!querySnapshot.empty) {
         const nonAttendeesUsers = querySnapshot.docs?.map(
            (doc) => doc.data() as UserLivestreamData
         )
         return nonAttendeesUsers
      }

      return []
   }

   async updateLiveStreamStats(
      livestreamId: string,
      operationsToMake: OperationsToMake
   ): Promise<void> {
      const livestreamRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)

      const statsRef = livestreamRef.collection("stats").doc("livestreamStats")

      const statsSnap = await statsRef.get()

      if (!statsSnap.exists) {
         // Create the stats document
         const livestreamDoc = await livestreamRef.get()

         if (!livestreamDoc.exists) {
            return // Livestream was deleted, no need to update the stats
         }

         const statsDoc = createLiveStreamStatsDoc(
            this.addIdToDoc<LivestreamEvent>(livestreamDoc),
            statsRef.id
         )
         await statsRef.set(statsDoc)
      }

      // We have to use an update method here because the set method does not support nested updates/operations
      return statsRef.update(operationsToMake)
   }

   async syncLiveStreamStatsWithLivestream(
      snapshotChange: Change<DocumentSnapshot>
   ): Promise<void> {
      const latestLivestreamDoc = snapshotChange.after

      const statsRef = this.firestore
         .collection("livestreams")
         .doc(latestLivestreamDoc.id)
         .collection("stats")
         .doc("livestreamStats")

      if (!latestLivestreamDoc.exists) {
         // Livestream was deleted, delete the stats document
         return statsRef.delete()
      }

      const statsSnap = await statsRef.get()

      const livestream = this.addIdToDoc<LivestreamEvent>(
         latestLivestreamDoc as any
      )

      if (!statsSnap.exists) {
         // Create the stats document
         const statsDoc = createLiveStreamStatsDoc(livestream, statsRef.id)
         return statsRef.set(statsDoc)
      } else {
         const toUpdate: Pick<LiveStreamStats, "livestream"> = {
            livestream: livestream,
         }

         return statsRef.update(toUpdate)
      }
   }

   async addOperationsToLiveStreamStats(
      change: Change<DocumentSnapshot>,
      livestreamId: string,
      logger: FunctionsLogger
   ): Promise<void> {
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
         logger.info("No changes to livestream stats", {
            livestreamId,
            liveStreamStatsToUpdate: livestreamStatsDocOperationsToMake,
         })
      } else {
         // Update livestreamStats
         await this.updateLiveStreamStats(
            livestreamId,
            livestreamStatsDocOperationsToMake
         )

         logger.info("Updated livestream stats with the following operations", {
            livestreamId,
            livestreamStatsDocOperationsToMake,
         })
      }
   }
}
