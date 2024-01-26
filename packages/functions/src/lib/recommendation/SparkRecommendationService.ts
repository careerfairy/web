import { UserData } from "@careerfairy/shared-lib/users"
import { SparksDataFetcher } from "./services/DataFetcherRecommendations"
import {
   LikedSparks,
   SeenSparks,
   SharedSparks,
   SparkStats,
} from "@careerfairy/shared-lib/sparks/sparks"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import {
   handlePromisesAllSettled,
   sortRankedSparksByPoints,
   RankedSpark,
} from "@careerfairy/shared-lib/recommendation/sparks/RankedSpark"
import RecommendationSparksServiceCore, {
   IRecommendationSparksService,
} from "@careerfairy/shared-lib/recommendation/sparks/IRecommendationSparksService"
import { combineRankedDocuments } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { SparkBasedRecommendationsBuilder } from "./services/SparkBasedRecommendationsBuilder"
import { RankedSparkRepository } from "@careerfairy/shared-lib/recommendation/sparks/serivce/RankedSparkRepository"
import functions = require("firebase-functions")

export default class SparkRecommendationService
   extends RecommendationSparksServiceCore
   implements IRecommendationSparksService
{
   constructor(
      private readonly user: UserData,
      private readonly participatedEvents: LivestreamEvent[],
      private readonly likedSparkIds: string[],
      private readonly seenSparkIds: string[],
      private readonly sharedSparkIds: string[],
      private readonly allSparks: SparkStats[]
   ) {
      super(functions.logger)
   }

   /**
    * Function to get recommended sparks based on user actions
    *
    * @param limit - The maximum number of recommended sparks to retrieve
    * @returns A promise that resolves to an array of recommended spark IDs
    */
   async getRecommendations(limit = 30): Promise<string[]> {
      const promises: Promise<RankedSpark[]>[] = []

      if (this.user) {
         // Fetch top {limit} recommended events based on the user's Metadata
         promises.push(
            Promise.resolve(
               this.getRecommendedSparksBasedOnUserData(
                  this.user,
                  this.allSparks,
                  limit
               )
            )
         )

         // Fetch top {limit} recommended Sparks based on the user actions, e.g. the events they have attended
         promises.push(this.getRecommendedSparksBasedOnUserActions(limit))

         // deduct points for all the Seen Sparks
         promises.push(this.updateRecommendedSparksBasedOnSeenSparks())
      }

      // Await all promises
      const recommendedSparks = await handlePromisesAllSettled(
         promises,
         this.log.error
      )

      return this.process(recommendedSparks, limit, this.allSparks, this.user)
   }

   /**
    * Function to get recommended sparks based on user actions
    *
    * @param limit - The maximum number of recommended sparks to retrieve
    * @returns A promise that resolves to an array of recommended spark IDs
    */
   private async getRecommendedSparksBasedOnUserActions(
      limit: number
   ): Promise<RankedSpark[]> {
      const promises: Promise<RankedSpark[]>[] = [
         // Get sparks based on the user's previously attended events
         this.getRecommendedSparksBasedOnPreviousWatchedEvents(limit),

         // Get last X sparks based on the user's interaction with sparks
         this.getRecommendedSparksBasedOnSparksInteractions(
            limit,
            this.likedSparkIds.slice(0, 10)
         ),
         this.getRecommendedSparksBasedOnSparksInteractions(
            limit,
            this.sharedSparkIds.slice(0, 10)
         ),
         this.getRecommendedSparksBasedOnSparksInteractions(
            limit,
            this.seenSparkIds.slice(0, 20)
         ),
      ]

      // Await all promises
      const arrayOfRecommendedSparksBasedOnUserActions =
         await handlePromisesAllSettled(promises, this.log.error)

      // Combine the results of recommended sparks based on user actions
      const combinedResults = combineRankedDocuments<RankedSpark>(
         arrayOfRecommendedSparksBasedOnUserActions
      )

      // Sort the combined results by points
      return sortRankedSparksByPoints(combinedResults)
   }

   /**
    * Function to get recommended sparks based on previously watched events
    *
    * @param limit - The maximum number of recommended sparks to retrieve
    */
   private async getRecommendedSparksBasedOnPreviousWatchedEvents(
      limit = 30
   ): Promise<RankedSpark[]> {
      const sparksBasedRecommendations = new SparkBasedRecommendationsBuilder(
         limit,
         this.allSparks,
         this.participatedEvents,
         new RankedSparkRepository(this.allSparks)
      )

      return sparksBasedRecommendations
         .mostCommonLivestreamCompanyCountryCode()
         .mostCommonLivestreamCompanyIndustries()
         .mostCommonLivestreamCompanySizes()
         .get()
   }

   /**
    * Function to update recommended sparks based on seen sparks
    */
   private async updateRecommendedSparksBasedOnSeenSparks(): Promise<
      RankedSpark[]
   > {
      const seenSparks = this.allSparks.filter((spark) =>
         this.seenSparkIds.includes(spark.id)
      )

      const sparksBasedRecommendations = new SparkBasedRecommendationsBuilder(
         30,
         seenSparks,
         this.participatedEvents,
         new RankedSparkRepository(this.allSparks)
      )

      return sparksBasedRecommendations.deductSeenSparks().get()
   }

   /**
    * Function to get recommended sparks based on sparks interactions
    *
    * @param limit - The maximum number of recommended sparks to retrieve
    * @param sparkIds - The array of spark IDs to base the recommendations on
    * @returns A promise that resolves to an array of recommended sparks
    */
   private async getRecommendedSparksBasedOnSparksInteractions(
      limit = 10,
      sparkIds: string[]
   ): Promise<RankedSpark[]> {
      const sparkInteractions = this.allSparks.filter((spark) =>
         sparkIds.includes(spark.id)
      )

      const sparksBasedRecommendations = new SparkBasedRecommendationsBuilder(
         limit,
         sparkInteractions,
         this.participatedEvents,
         new RankedSparkRepository(this.allSparks)
      )

      return sparksBasedRecommendations
         .mostCommonCategory()
         .mostCommonCompanyIndustries()
         .mostCommonCompanySizes()
         .mostCommonCompanyCountryCode()
         .get()
   }

   static async create(
      dataFetcher: SparksDataFetcher
   ): Promise<IRecommendationSparksService> {
      const [
         user,
         userLikedSparks,
         userSeenSparks,
         userSharedSparks,
         allSparksStats,
         participatedEvents,
      ] = await Promise.all([
         dataFetcher.getUser(),
         dataFetcher.getLikedSparks(),
         dataFetcher.getSeenSparks(),
         dataFetcher.getSharedSparks(),
         dataFetcher.getAllSparksStats(),
         dataFetcher.getParticipatedLivestreams(),
      ])

      const likedSparkIds = getSortedSparkIds(userLikedSparks)
      const seenSparkIds = getSortedSparkIds(userSeenSparks)
      const sharedSparkIds = getSortedSparkIds(userSharedSparks)

      return new SparkRecommendationService(
         user,
         participatedEvents,
         likedSparkIds,
         seenSparkIds,
         sharedSparkIds,
         allSparksStats
      )
   }
}

function getSortedSparkIds(
   userSparks: LikedSparks[] | SeenSparks[] | SharedSparks[]
): string[] {
   // Flatten the sparks from each object into a single array
   const sparkEntries = userSparks.reduce((acc, { sparks }) => {
      const entries = Object.entries(sparks)
      return acc.concat(entries)
   }, [])

   // Sort the entries in descending order based on their date
   const sortedEntries = sparkEntries.sort(
      (a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime()
   )

   // Take the first {limit} elements
   // const lastSparks = sortedEntries.slice(0, limit)

   // Extract the sparkIds from the entries
   const result = sortedEntries.map((entry) => entry[0])

   return result
}
