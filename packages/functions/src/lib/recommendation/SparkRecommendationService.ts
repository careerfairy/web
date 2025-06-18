import { combineRankedDocuments } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import RecommendationSparksServiceCore, {
   IRecommendationSparksService,
} from "@careerfairy/shared-lib/recommendation/sparks/IRecommendationSparksService"
import { RankedSpark } from "@careerfairy/shared-lib/recommendation/sparks/RankedSpark"
import { RankedSparkRepository } from "@careerfairy/shared-lib/recommendation/sparks/service/RankedSparkRepository"
import {
   handlePromisesAllSettled,
   sortRankedByPoints,
} from "@careerfairy/shared-lib/recommendation/utils"
import {
   LikedSparks,
   SeenSparks,
   SharedSparks,
   SparkStats,
} from "@careerfairy/shared-lib/sparks/sparks"
import {
   AdditionalUserRecommendationInfo,
   StudyBackground,
   UserData,
} from "@careerfairy/shared-lib/users"
import { Timestamp } from "../../api/firestoreAdmin"
import { SparksDataFetcher } from "./services/DataFetcherRecommendations"
import { SparkBasedRecommendationsBuilder } from "./services/SparkBasedRecommendationsBuilder"
import functions = require("firebase-functions")

export default class SparkRecommendationService
   extends RecommendationSparksServiceCore
   implements IRecommendationSparksService
{
   private additionalUserInfo: AdditionalUserRecommendationInfo = {
      studyBackgrounds: [],
      languages: [],
   }

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

      promises.push(this.getAllInitialRecommendations())

      if (this.user) {
         // Fetch top {limit} recommended events based on the user's Metadata
         promises.push(
            Promise.resolve(
               this.getRecommendedSparksBasedOnUserData(
                  this.user,
                  this.allSparks,
                  this.additionalUserInfo,
                  limit
               )
            )
         )

         // Fetch top {limit} recommended Sparks based on the user actions, e.g. the events they have attended
         promises.push(this.getRecommendedSparksBasedOnUserActions(limit))

         // Fetch recommended Sparks based on the group's trial plan
         promises.push(this.getRecommendedSparksBasedOnTrialPlan())
      }

      // Await all promises
      const recommendedSparks = await handlePromisesAllSettled(
         promises,
         this.log.error
      )

      return this.process(recommendedSparks, limit, this.user)
   }

   /**
    * Function to get all initial recommendations
    *
    * @returns A promise that resolves to an array of ranked sparks
    */
   private async getAllInitialRecommendations(): Promise<RankedSpark[]> {
      // Create a new instance of RankedSparkRepository using allSparks
      const rankedSparksService = new RankedSparkRepository(this.allSparks)

      // Return all initial ranked sparks
      return rankedSparksService.getAllInitialRankedSparks()
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
         // deduct points for all the Seen Sparks and returns all the recommended sparks
         this.getAllRecommendedSparksBasedOnSeenSparks(),
      ]

      // Await all promises
      const arrayOfRecommendedSparksBasedOnUserActions =
         await handlePromisesAllSettled(promises, this.log.error)

      // Combine the results of recommended sparks based on user actions
      const combinedResults = combineRankedDocuments<RankedSpark>(
         arrayOfRecommendedSparksBasedOnUserActions
      )

      // Sort the combined results by points
      return sortRankedByPoints<RankedSpark>(combinedResults)
   }

   /**
    * Function to get recommended sparks based on previously watched events
    *
    * @param limit - The maximum number of recommended sparks to retrieve
    */
   private async getRecommendedSparksBasedOnPreviousWatchedEvents(
      limit: number
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
    * Function to get recommended sparks based on trial plan
    */
   private async getRecommendedSparksBasedOnTrialPlan(): Promise<
      RankedSpark[]
   > {
      const now = Timestamp.now().toMillis()

      const validTrialPlanSparks = this.allSparks.filter((spark) =>
         Boolean(
            spark.spark.group.plan?.type === GroupPlanTypes.Trial &&
               spark.spark.group.plan.expiresAt.toMillis() > now
         )
      )

      const sparksBasedRecommendations = new SparkBasedRecommendationsBuilder(
         this.allSparks.length,
         validTrialPlanSparks,
         this.participatedEvents,
         new RankedSparkRepository(this.allSparks)
      )

      return sparksBasedRecommendations.trialPlanSparks().get()
   }

   /**
    * Function to get all recommended sparks based on seen sparks
    */
   private async getAllRecommendedSparksBasedOnSeenSparks(): Promise<
      RankedSpark[]
   > {
      const seenSparks = this.allSparks.filter((spark) =>
         this.seenSparkIds.includes(spark.id)
      )

      const sparksBasedOnSeenSparks = new SparkBasedRecommendationsBuilder(
         this.allSparks.length,
         seenSparks,
         this.participatedEvents,
         new RankedSparkRepository(this.allSparks)
      )

      return sparksBasedOnSeenSparks.deductSeenSparks().get()
   }

   /**
    * Function to get recommended sparks based on sparks interactions
    *
    * @param limit - The maximum number of recommended sparks to retrieve
    * @param sparkIds - The array of spark IDs to base the recommendations on
    * @returns A promise that resolves to an array of recommended sparks
    */
   private async getRecommendedSparksBasedOnSparksInteractions(
      limit: number,
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

   public setAdditionalUserInfo(
      additionalUserInfo: AdditionalUserRecommendationInfo
   ): SparkRecommendationService {
      this.additionalUserInfo = additionalUserInfo
      return this
   }

   public setStudyBackgrounds(
      studyBackgrounds: StudyBackground[]
   ): SparkRecommendationService {
      this.additionalUserInfo.studyBackgrounds = studyBackgrounds
      return this
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

   // Extract the sparkIds from the entries
   const result = sortedEntries.map((entry) => entry[0])

   return result
}
