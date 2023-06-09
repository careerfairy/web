import {
   FirebaseLivestreamRepository,
   ILivestreamRepository,
} from "@careerfairy/shared-lib/livestreams/LivestreamRepository"
import {
   EventRating,
   EventRatingAnswer,
   LivestreamEvent,
   pickPublicDataFromLivestream,
   UserLivestreamData,
} from "@careerfairy/shared-lib/livestreams"
import {
   calculateNewAverage,
   normalizeRating,
} from "@careerfairy/shared-lib/livestreams/ratings"
import {
   getPopularityPoints,
   PopularityEventData,
} from "@careerfairy/shared-lib/livestreams/popularity"
import type { OperationsToMake } from "./stats/util"
import type { Change } from "firebase-functions"
import * as functions from "firebase-functions"
import {
   createLiveStreamStatsDoc,
   LiveStreamStats,
} from "@careerfairy/shared-lib/livestreams/stats"
import { firestore } from "firebase-admin"
import { isEmpty } from "lodash"
import { addOperations } from "./stats/livestream"
import type { FunctionsLogger } from "../util"
import DocumentSnapshot = firestore.DocumentSnapshot
import FieldValue = firestore.FieldValue
import { DateTime } from "luxon"

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

   getYesterdayLivestreams(): Promise<LivestreamEvent[]>

   /**
    * Checks if there are more than 'n' livestream events scheduled for the next 'days' days.
    *
    * @param {number} n - The number of livestreams to check for.
    * @param {number} days - The number of days into the future to check for upcoming livestreams.
    * @returns {Promise<boolean>} A promise that resolves to true if there are more than 'n' livestreams
    *                            scheduled for the next 'days' days, otherwise false.
    */
   hasMoreThanNLivestreamsInNextNDays(n: number, days: number): Promise<boolean>

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

   syncLiveStreamStatsNewRating(
      livestreamId: string,
      ratingName: string,
      newRating: EventRatingAnswer
   ): Promise<void>
}

export class LivestreamFunctionsRepository
   extends FirebaseLivestreamRepository
   implements ILivestreamFunctionsRepository
{
   async syncLiveStreamStatsNewRating(
      livestreamId: string,
      ratingName: string,
      newRating: EventRatingAnswer
   ): Promise<void> {
      const parentRatingDoc = await this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("rating")
         .doc(ratingName)
         .get()

      if (!parentRatingDoc.exists) {
         console.error(
            "Parent rating document not found",
            livestreamId,
            ratingName,
            newRating
         )
         return
      }

      const ratingDoc = parentRatingDoc.data() as EventRating

      // also update the livestream aggregated rating
      const normalizedRating = normalizeRating(ratingDoc, newRating)

      if (normalizedRating && normalizedRating >= 1 && normalizedRating <= 5) {
         await this.updateLiveStreamStats(livestreamId, (existingStats) => {
            const existingNumOfRatings =
               existingStats?.ratings?.[ratingName]?.numberOfRatings ?? 0

            const newAvg = calculateNewAverage(
               existingStats,
               ratingName,
               normalizedRating
            )

            // will use firestore.update() behind the scenes
            const toUpdate = {}
            toUpdate[`ratings.${ratingName}.averageRating`] = newAvg
            toUpdate[`ratings.${ratingName}.numberOfRatings`] =
               existingNumOfRatings + 1

            return toUpdate
         })
      }
   }

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
         return querySnapshot.docs?.map(
            (doc) => doc.data() as UserLivestreamData
         )
      }

      return []
   }

   async getYesterdayLivestreams(): Promise<LivestreamEvent[]> {
      const yesterdayStartOfTheDay = new Date()
      yesterdayStartOfTheDay.setDate(yesterdayStartOfTheDay.getDate() - 1)
      yesterdayStartOfTheDay.setHours(0, 0, 0)

      const todayStartOfDay = new Date()
      todayStartOfDay.getDate()
      todayStartOfDay.setHours(0, 0, 0)

      const querySnapshot = await this.firestore
         .collection("livestreams")
         .where("start", ">", yesterdayStartOfTheDay)
         .where("start", "<", todayStartOfDay)
         .get()

      if (!querySnapshot.empty) {
         return querySnapshot.docs?.map((doc) => doc.data() as LivestreamEvent)
      }

      return []
   }

   async hasMoreThanNLivestreamsInNextNDays(
      n: number,
      days: number
   ): Promise<boolean> {
      const now = DateTime.now()
      const futureDate = now.plus({ days })

      const querySnapshot = await this.firestore
         .collection("livestreams")
         .where("start", ">", now.toJSDate())
         .where("start", "<", futureDate.toJSDate())
         .limit(n + 1) // we only need to know if there are more than n, so limit to n+1
         .get()

      return querySnapshot.size > n
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
            livestream: pickPublicDataFromLivestream(livestream),
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

      // Check if there are any updates to livestreamStats
      if (isEmpty(livestreamStatsDocOperationsToMake)) {
         logger.info("No changes to livestream stats", {
            livestreamId,
            liveStreamStatsToUpdate: livestreamStatsDocOperationsToMake,
         })
      } else {
         // Update livestreamStats
         await this.updateLiveStreamStats<OperationsToMake>(
            livestreamId,
            () => livestreamStatsDocOperationsToMake
         )

         logger.info("Updated livestream stats with the following operations", {
            livestreamId,
            livestreamStatsDocOperationsToMake,
         })
      }
   }
}
