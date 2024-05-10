import { Timestamp } from "@careerfairy/shared-lib/firebaseTypes"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { ILivestreamRepository } from "@careerfairy/shared-lib/livestreams/LivestreamRepository"
import {
   LikedSparks,
   SeenSparks,
   SharedSparks,
   Spark,
   SparkStats,
} from "@careerfairy/shared-lib/sparks/sparks"
import { UserData } from "@careerfairy/shared-lib/users"
import { IUserRepository } from "@careerfairy/shared-lib/users/UserRepository"
import { ISparkFunctionsRepository } from "src/lib/sparks/SparkFunctionsRepository"
import { BundleLoader } from "../../bundleLoader"
/**
 * Interface that holds the contract that fetches data for
 * the recommendation service
 */
export interface IRecommendationDataFetcher {
   getFutureLivestreams(): Promise<LivestreamEvent[]>

   getPastLivestreams(): Promise<LivestreamEvent[]>

   getUser(): Promise<UserData>

   getWatchedSparks(userId: string): Promise<Spark[]>
}

/**
 * Fetch data from the Firestore Bundles
 *
 * Useful when generating the newsletters, generic data for all users
 */
export class NewsletterDataFetcher implements IRecommendationDataFetcher {
   constructor(
      private readonly loader: BundleLoader,
      private readonly userRepo: IUserRepository,
      private readonly sparksRepo: ISparkFunctionsRepository
   ) {}

   getUser(): Promise<UserData> {
      // no need to fetch the user here
      // the caller should already have the userData object
      throw new Error("Not implemented")
   }

   getFutureLivestreams(): Promise<LivestreamEvent[]> {
      return this.loader.getDocs<LivestreamEvent>("future-livestreams-query")
   }

   getPastLivestreams(): Promise<LivestreamEvent[]> {
      return this.loader.getDocs<LivestreamEvent>("past-livestreams-query")
   }

   async getWatchedSparks(userId: string): Promise<Spark[]> {
      // fetch the last 10 registered livestreams for this user only
      const seenSparks = await this.userRepo.getUserSeenSparks(userId)

      if (!seenSparks) return []

      const sparkIds = sortSeenSparks(seenSparks, 10)

      const sparks = await this.sparksRepo.getSparksByIds(sparkIds)

      // Re sort ensuring order stays the same after fetching data
      const sortedSparks = (sparks || []).sort((baseSpark, comparisonSpark) => {
         const baseSortedIndex = sparkIds.indexOf(baseSpark.id)
         const comparisonSortedIndex = sparkIds.indexOf(comparisonSpark.id)

         return baseSortedIndex - comparisonSortedIndex
      })

      return sortedSparks
   }

   static async create(
      userRepo: IUserRepository,
      sparksRepo: ISparkFunctionsRepository
   ): Promise<NewsletterDataFetcher> {
      const loader = new BundleLoader()

      // fetch the bundles data from remote cdn
      await Promise.all([
         loader.fetch("futureLivestreamsNext15Days"),
         loader.fetch("pastYearLivestreams"),
      ])

      return new NewsletterDataFetcher(loader, userRepo, sparksRepo)
   }
}

/**
 * Fetch data for a specific user
 *
 * Useful when generating recommended events for a specific user
 */
export class UserDataFetcher implements IRecommendationDataFetcher {
   private loader: BundleLoader
   constructor(
      private readonly userId: string,
      private readonly livestreamRepo: ILivestreamRepository,
      private readonly userRepo: IUserRepository,
      private readonly sparksRepo: ISparkFunctionsRepository
   ) {
      this.loader = new BundleLoader()
   }

   async getUser(): Promise<UserData> {
      return this.userRepo.getUserDataById(this.userId)
   }

   async getFutureLivestreams(): Promise<LivestreamEvent[]> {
      await this.loader.fetch("allFutureLivestreams")

      return this.loader.getDocs<LivestreamEvent>("future-livestreams-query")
   }

   getPastLivestreams(): Promise<LivestreamEvent[]> {
      // fetch the last 10 registered livestreams for this user only
      return this.livestreamRepo.getRegisteredEvents(this.userId, {
         to: new Date(),
         orderByDirection: "desc",
         limit: 10,
      })
   }

   async getWatchedSparks(userId: string): Promise<Spark[]> {
      // fetch the last 10 registered livestreams for this user only
      const seenSparks = await this.userRepo.getUserSeenSparks(userId)

      if (!seenSparks) return []

      const sparkIds = sortSeenSparks(seenSparks, 10)

      const sparks = await this.sparksRepo.getSparksByIds(sparkIds)

      // Re sort ensuring order stays the same after fetching data
      const sortedSparks = (sparks || []).sort((baseSpark, comparisonSpark) => {
         const baseSortedIndex = sparkIds.indexOf(baseSpark.id)
         const comparisonSortedIndex = sparkIds.indexOf(comparisonSpark.id)

         return baseSortedIndex - comparisonSortedIndex
      })

      return sortedSparks
   }
}

const sortSparksMapIds = (sparks: {
   [sparkId: string]: Timestamp
}): string[] => {
   const keys = Object.keys(sparks)

   if (!keys.length) return []
   const sortedSparks = keys
      .map((sparkId) => {
         return {
            sparkId: sparkId,
            seenTimestamp: sparks[sparkId],
         }
      })
      .sort(sortSparksBySeenTimestamp)

   return sortedSparks.map((sortedSpark) => sortedSpark.sparkId)
}

const sortSeenSparks = (seenSparks: SeenSparks[], limit: number): string[] => {
   const allSparks = seenSparks
      .flatMap((seenSpark) => {
         const sortedSparkIds = sortSparksMapIds(seenSpark.sparks)
         return sortedSparkIds.map((id) => {
            return {
               sparkId: id,
               seenTimestamp: seenSpark.sparks[id],
            }
         })
      })
      .sort(sortSparksBySeenTimestamp)

   return allSparks.map((sortedSpark) => sortedSpark.sparkId).slice(0, limit)
}

const sortSparksBySeenTimestamp = (baseSpark, comparisonSpark) =>
   comparisonSpark.seenTimestamp.toMillis() - baseSpark.seenTimestamp.toMillis()

export class SparksDataFetcher {
   private loader: BundleLoader
   constructor(
      private readonly userId: string,
      private readonly livestreamRepo: ILivestreamRepository,
      private readonly userRepo: IUserRepository,
      private readonly sparksRepo: ISparkFunctionsRepository
   ) {
      this.loader = new BundleLoader()
   }

   // Get user data by user ID
   async getUser(): Promise<UserData> {
      return this.userRepo.getUserDataById(this.userId)
   }

   // Get the last 5 participated livestreams for this user only
   getParticipatedLivestreams(): Promise<LivestreamEvent[]> {
      return this.livestreamRepo.getParticipatedEvents(this.userId, {
         to: new Date(),
         orderByDirection: "desc",
         limit: 5,
      })
   }

   // Fetch all spark statistics
   async getAllSparksStats(): Promise<SparkStats[]> {
      await this.loader.fetch("allSparksStats")
      return this.loader.getDocs<SparkStats>("all-sparks-stats")
   }

   // Get shared sparks for the user
   getSharedSparks(): Promise<SharedSparks[]> {
      return this.sparksRepo.getUserSparkInteraction<SharedSparks>(
         this.userId,
         "sharedSparks"
      )
   }

   // Get liked sparks for the user
   getLikedSparks(): Promise<LikedSparks[]> {
      return this.sparksRepo.getUserSparkInteraction<LikedSparks>(
         this.userId,
         "likedSparks"
      )
   }

   // Get seen sparks for the user
   getSeenSparks(): Promise<SeenSparks[]> {
      return this.sparksRepo.getUserSparkInteraction<SeenSparks>(
         this.userId,
         "seenSparks"
      )
   }
}
