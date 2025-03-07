import { CustomJobApplicant } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Group } from "@careerfairy/shared-lib/groups"
import { IGroupRepository } from "@careerfairy/shared-lib/groups/GroupRepository"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { ILivestreamRepository } from "@careerfairy/shared-lib/livestreams/LivestreamRepository"
import {
   LikedSparks,
   SeenSparks,
   SharedSparks,
   Spark,
   SparkStats,
   sortSeenSparks,
   sortSparksByIds,
} from "@careerfairy/shared-lib/sparks/sparks"
import {
   CompanyFollowed,
   ProfileLanguage,
   RegisteredLivestreams,
   StudyBackground,
   UserData,
} from "@careerfairy/shared-lib/users"
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

   getInteractedLivestreams(userId: string): Promise<LivestreamEvent[]>

   getAppliedJobs(userId: string): Promise<CustomJobApplicant[]>
   getFollowedCompanies(userId: string): Promise<CompanyFollowed[]>

   getUserRegisteredLivestreams(): Promise<RegisteredLivestreams>

   getUserStudyBackgrounds(): Promise<StudyBackground[]>

   getUserLanguages(): Promise<ProfileLanguage[]>
}

/**
 * Fetch data from the Firestore Bundles
 *
 * Useful when generating the newsletters, generic data for all users
 */
export class NewsletterDataFetcher implements IRecommendationDataFetcher {
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

   async getUserRegisteredLivestreams(): Promise<RegisteredLivestreams> {
      // Not implemented for newsletter, since data fetching would be per
      // user meaning an excess number requests would be made for each subscribed user
      throw new Error("Not implemented")
   }

   async getInteractedLivestreams(userId: string): Promise<LivestreamEvent[]> {
      // Not implemented for newsletter, since data fetching would be per
      // user meaning an excess number requests would be made for each subscribed user
      throw new Error("Not implemented: " + userId)
   }

   async getAppliedJobs(userId: string): Promise<CustomJobApplicant[]> {
      // Not implemented for newsletter, since data fetching would be per
      // user meaning an excess number requests would be made for each subscribed user
      throw new Error("Not implemented: " + userId)
   }

   async getWatchedSparks(userId: string): Promise<Spark[]> {
      // Not implemented for newsletter, since data fetching would be per
      // user meaning an excess number requests would be made for each subscribed user
      throw new Error("Not implemented: " + userId)
   }

   async getFollowedCompanies(userId: string): Promise<CompanyFollowed[]> {
      // Not implemented for newsletter, since data fetching would be per
      // user meaning an excess number requests would be made for each subscribed user
      throw new Error("Not implemented: " + userId)
   }

   async getUserStudyBackgrounds(): Promise<StudyBackground[]> {
      // Not implemented for newsletter, since data fetching would be per
      // user meaning an excess number requests would be made for each subscribed user
      throw new Error("Not implemented")
   }

   async getUserLanguages(): Promise<ProfileLanguage[]> {
      // Not implemented for newsletter, since data fetching would be per
      // user meaning an excess number requests would be made for each subscribed user
      throw new Error("Not implemented")
   }

   static async create(): Promise<NewsletterDataFetcher> {
      const loader = new BundleLoader()

      // fetch the bundles data from remote cdn
      await Promise.all([
         loader.fetch("futureLivestreamsNext15Days"),
         loader.fetch("pastYearLivestreams"),
      ])

      return new NewsletterDataFetcher(loader)
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

   async getUserRegisteredLivestreams(): Promise<RegisteredLivestreams> {
      return this.userRepo.getUserRegisteredLivestreams(this.userId)
   }

   getPastLivestreams(): Promise<LivestreamEvent[]> {
      // fetch the last 10 registered livestreams for this user only
      return this.livestreamRepo.getRegisteredEvents(this.userId, {
         limit: 10,
      })
   }

   async getInteractedLivestreams(userId: string): Promise<LivestreamEvent[]> {
      return this.livestreamRepo.getUserInteractedLivestreams(userId, 10)
   }

   async getAppliedJobs(userId: string): Promise<CustomJobApplicant[]> {
      return this.userRepo.getCustomJobApplications(userId, 10)
   }

   async getWatchedSparks(userId: string): Promise<Spark[]> {
      // fetch the last 20 registered livestreams for this user only
      const seenSparks = await this.userRepo.getUserSeenSparks(userId)

      if (!seenSparks) return []

      const sparkIds = sortSeenSparks(seenSparks, 20)

      const sparks = (await this.sparksRepo.getSparksByIds(sparkIds)) || []

      // Re sort ensuring order stays the same after fetching data
      const sortedSparks = sortSparksByIds(sparkIds, sparks)

      // Using const to allow easier debugging
      return sortedSparks
   }

   async getFollowedCompanies(userId: string): Promise<CompanyFollowed[]> {
      const companies = await this.userRepo.getCompaniesUserFollows(userId)
      return companies || []
   }

   async getUserStudyBackgrounds(): Promise<StudyBackground[]> {
      return this.userRepo.getUserStudyBackgrounds(this.userId)
   }

   async getUserLanguages(): Promise<ProfileLanguage[]> {
      return this.userRepo.getUserLanguages(this.userId)
   }
}

export class SparksDataFetcher {
   private loader: BundleLoader
   constructor(
      private readonly userId: string,
      private readonly livestreamRepo: ILivestreamRepository,
      private readonly userRepo: IUserRepository,
      private readonly sparksRepo: ISparkFunctionsRepository,
      private readonly groupRepo: IGroupRepository
   ) {
      this.loader = new BundleLoader()
   }

   // Get user data by user ID
   async getUser(): Promise<UserData> {
      return this.userRepo.getUserDataById(this.userId)
   }

   // Get the last 5 participated livestreams for this user only
   getParticipatedLivestreams(): Promise<LivestreamEvent[]> {
      return this.livestreamRepo.getParticipatedEvents(this.userId, 5)
   }

   // Fetch all spark statistics
   async getAllSparksStats(): Promise<SparkStats[]> {
      await this.loader.fetch("allSparksStats")
      return this.loader.getDocs<SparkStats>("all-sparks-stats")
   }

   async getSparkGroups(
      groupIds: string[]
   ): Promise<{ [sparkId: string]: Group }> {
      const groups = await this.groupRepo.getGroupsByIds(groupIds)
      return groups.reduce((acc, group) => {
         acc[group.id] = group
         return acc
      }, {})
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
