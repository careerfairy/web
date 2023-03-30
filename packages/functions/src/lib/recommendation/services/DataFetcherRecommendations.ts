import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { ILivestreamRepository } from "@careerfairy/shared-lib/livestreams/LivestreamRepository"
import { UserData } from "@careerfairy/shared-lib/users"
import { IUserRepository } from "@careerfairy/shared-lib/users/UserRepository"
import { BundleLoader } from "../../bundleLoader"

/**
 * Interface that holds the contract that fetches data for
 * the recommendation service
 */
export interface IRecommendationDataFetcher {
   getFutureLivestreams(): Promise<LivestreamEvent[]>

   getPastLivestreams(): Promise<LivestreamEvent[]>

   getUser(): Promise<UserData>
}

/**
 * Fetch data from the Firestore Bundles
 *
 * Useful when generating the newsletters, generic data for all users
 */
export class BundleDataFetcher implements IRecommendationDataFetcher {
   constructor(private readonly loader: BundleLoader) {}

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

   static async create(): Promise<BundleDataFetcher> {
      const loader = new BundleLoader()

      // fetch the bundles data from remote cdn
      await Promise.all([
         loader.fetch("allFutureLivestreams"),
         loader.fetch("pastYearLivestreams"),
      ])

      return new BundleDataFetcher(loader)
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
      private readonly userRepo: IUserRepository
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
}
