import {
   SeenSparks,
   SeenSparksMap,
   Spark,
   UserSparksFeedMetrics,
   createSeenSparksMap,
} from "@careerfairy/shared-lib/sparks/sparks"
import { shuffle } from "@careerfairy/shared-lib/utils"
import { DateTime, Duration } from "luxon"
import { createGenericConverter } from "../util/firestore-admin"
import { Firestore, Timestamp } from "../api/firestoreAdmin"
import { addAddedToFeedAt } from "../util/sparks"

/**
 * The SparksFeedReplenisher class is responsible for replenishing the user's feed
 * based on certain metrics and conditions. It fetches new "sparks" to populate
 * the user's feed when it falls below a certain threshold.
 */
export class SparksFeedReplenisher {
   private firestore: Firestore
   // Target spark count in a user's feed
   private TARGET_SPARK_COUNT = 20
   // Buffer percentage to decide if replenishment is necessary
   private BUFFER_PERCENT = 0.8

   /**
    * Creates an instance of SparksFeedReplenisher.
    *
    * @param firestore - Firestore database instance
    */
   constructor(firestore: Firestore) {
      this.firestore = firestore
   }

   // Private methods...

   /**
    * Sets the status of the replenishing flag.
    *
    * @param userId - The ID of the user whose feed is being replenished
    * @param status - The new status to set ("started", "finished", or "failed")
    */
   private async setReplenishingFlag(
      userId: string,
      status: UserSparksFeedMetrics["replenishStatus"]
   ): Promise<void> {
      const ref = this.firestore.collection("sparksFeedMetrics").doc(userId)

      const toUpdate: Pick<
         UserSparksFeedMetrics,
         "replenishStatus" | "lastReplenished"
      > = {
         replenishStatus: status,
         ...(status === "finished" && {
            lastReplenished: Timestamp.now(),
         }),
      }

      await ref.update(toUpdate)
   }

   /**
    * Fetches and returns all seen sparks for a user.
    *
    * @param userId - The ID of the user
    * @returns A promise resolving to a SeenSparksMap
    */
   private async getUserSeenSparks(userId: string): Promise<SeenSparksMap> {
      const seenSparksMap: SeenSparksMap = {}

      const seenSparksSnap = await this.firestore
         .collection(`userData/${userId}/seenSparks`)
         .withConverter(createGenericConverter<SeenSparks>())
         .get()

      if (seenSparksSnap.empty) return seenSparksMap

      const seenSparksDocs = seenSparksSnap.docs.map((doc) => doc.data())

      return createSeenSparksMap(seenSparksDocs)
   }

   // Public methods...

   /**
    * Replenishes the feed of a given user.
    *
    * This method does the following:
    * 1. Checks if a replenishment process is already underway.
    * 2. Determines how many more sparks are needed.
    * 3. Fetches and adds new sparks.
    * 4. Commits the added sparks to the user's feed.
    *
    * @param userId - The ID of the user whose feed is to be replenished
    * @param feed - The current metrics of the user's feed
    */
   async replenishUserFeed(
      userId: string,
      feed: UserSparksFeedMetrics
   ): Promise<void> {
      const addedSparkIds = new Set<string>()

      const allFetchedSparks: Spark[] = []

      const EXPIRY_DURATION = Duration.fromObject({ weeks: 1 }).as(
         "milliseconds"
      ) // One week in milliseconds

      // Check if a replenish process is already underway
      if (feed.replenishStatus === "started") {
         return
      }
      const currentSparkCount = feed.numberOfSparks

      if (currentSparkCount >= this.TARGET_SPARK_COUNT * this.BUFFER_PERCENT) {
         return
      }

      try {
         await this.setReplenishingFlag(userId, "started")

         let neededSparks = this.TARGET_SPARK_COUNT - currentSparkCount

         const batch = this.firestore.batch()
         const allSeenSparksMap = await this.getUserSeenSparks(userId)
         const expiredSeenSparksMap: SeenSparksMap = {}
         const currentTime = DateTime.now()

         Object.entries(allSeenSparksMap).forEach(([sparKId, lastSeen]) => {
            if (
               currentTime.diff(
                  DateTime.fromJSDate(lastSeen.toDate()),
                  "milliseconds"
               ).milliseconds > EXPIRY_DURATION
            ) {
               expiredSeenSparksMap[sparKId] = lastSeen
            }
         })

         // Helper function to fill newSparks from a snapshot
         const fillFromSnapshot = (
            snap: FirebaseFirestore.QuerySnapshot<Spark>
         ) => {
            snap.docs.forEach((doc) => {
               const spark = doc.data()
               const sparkId = doc.id

               if (
                  // Only add the spark if the user hasn't seen it
                  !allSeenSparksMap[sparkId] ||
                  // Or if the user hasn't seen it in a week
                  expiredSeenSparksMap[sparkId]
               ) {
                  addAddedToFeedAt(spark)
                  batch.set(
                     this.firestore
                        .collection("userData")
                        .doc(userId)
                        .collection("sparksFeed")
                        .doc(sparkId),
                     spark,
                     { merge: true }
                  )
                  addedSparkIds.add(sparkId) // Add to addedSparkIds set
                  neededSparks--
               }
               // Add to all fetched sparks
               allFetchedSparks.push(spark)
            })
         }

         // Step 1: Fetch most recent, unseen sparks
         let lastSeenDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null
         while (neededSparks > 0) {
            let query = this.firestore
               .collection("sparks")
               .where("group.publicSparks", "==", true)
               .withConverter(createGenericConverter<Spark>())
               .orderBy("publishedAt", "desc")
               .limit(this.TARGET_SPARK_COUNT) // Fetch 20 sparks at a time

            if (lastSeenDoc) query = query.startAfter(lastSeenDoc)

            const sparksSnap = await query.get()

            if (sparksSnap.empty) break // No more sparks available

            fillFromSnapshot(sparksSnap)

            lastSeenDoc = sparksSnap.docs[sparksSnap.docs.length - 1]
         }

         // Step 2: Add random
         if (neededSparks > 0) {
            // Backfill remaining neededSparks

            shuffle(allFetchedSparks) // Shuffle to increase randomness

            allFetchedSparks
               // Filter out added sparks to avoid duplicates
               .filter((spark) => !addedSparkIds.has(spark.id))
               // Filter out seen sparks
               .slice(0, neededSparks)
               .forEach((spark) => {
                  addAddedToFeedAt(spark)

                  batch.set(
                     this.firestore
                        .collection("userData")
                        .doc(userId)
                        .collection("sparksFeed")
                        .doc(spark.id),
                     spark,
                     { merge: true }
                  )
                  addedSparkIds.add(spark.id) // Add to addedSparkIds set
               })
         }

         // Commit the batch
         await batch.commit()

         // Set the replenishing status to "finished"
         await this.setReplenishingFlag(userId, "finished")
         return
      } catch (error) {
         await this.setReplenishingFlag(userId, "failed")
         throw error
      }
   }
}
