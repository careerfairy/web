import {
   Spark,
   UserSparksFeedMetrics,
} from "@careerfairy/shared-lib/sparks/sparks"
import { Firestore, Timestamp } from "../../api/firestoreAdmin"
import {
   groupRepo,
   livestreamsRepo,
   sparkRepo,
   userRepo,
} from "../../api/repositories"
import { addAddedToFeedAt } from "../../util/sparks"
import SparkRecommendationService from "../recommendation/SparkRecommendationService"
import { SparksDataFetcher } from "../recommendation/services/DataFetcherRecommendations"

/**
 * The SparksFeedReplenisher class is responsible for replenishing the user's feed
 * based on certain metrics and conditions. It fetches new "sparks" to populate
 * the user's feed when it falls below a certain threshold.
 */
export class SparksFeedReplenisher {
   private firestore: Firestore
   // Target spark count in a user's feed
   private TARGET_SPARK_COUNT = 30
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

   // Public methods...

   /**
    * Replenishes the user's feed by fetching and adding new sparks.
    *
    * This method performs the following actions:
    * 1. Checks if a replenishment process is already underway.
    * 2. Determines the additional sparks required to meet the target count.
    * 3. Fetches and adds new sparks to the user's feed.
    * 4. Commits the added sparks to the user's feed.
    *
    * @param userId - The ID of the user whose feed is to be replenished
    * @param feed - The current metrics of the user's feed
    */
   async replenishUserFeed(
      userId: string,
      feed: UserSparksFeedMetrics
   ): Promise<void> {
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

         const batch = this.firestore.batch()

         const fillFeedFromRecommendedSparks = (sparks: Spark[]) => {
            sparks.forEach((spark) => {
               const sparkRef = this.firestore
                  .collection("userData")
                  .doc(userId)
                  .collection("sparksFeed")
                  .doc(spark.id)

               addAddedToFeedAt(spark)

               batch.set(sparkRef, spark, { merge: true })
            })
         }

         const dataFetcher = new SparksDataFetcher(
            userId,
            livestreamsRepo,
            userRepo,
            sparkRepo,
            groupRepo
         )

         const [studyBackgrounds, recommendationService] = await Promise.all([
            userRepo.getUserStudyBackgrounds(userId),
            SparkRecommendationService.create(dataFetcher),
         ])

         recommendationService.setStudyBackgrounds(studyBackgrounds)

         const recommendedSparkIds =
            await recommendationService.getRecommendations(
               this.TARGET_SPARK_COUNT
            )

         const recommendedSparks = await sparkRepo.getSparksByIds(
            recommendedSparkIds
         )

         fillFeedFromRecommendedSparks(recommendedSparks)

         await batch.commit()

         await this.setReplenishingFlag(userId, "finished")
         return
      } catch (error) {
         await this.setReplenishingFlag(userId, "failed")
         throw error
      }
   }
}
