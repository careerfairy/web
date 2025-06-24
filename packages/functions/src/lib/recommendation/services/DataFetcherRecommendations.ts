import { ICustomJobRepository } from "@careerfairy/shared-lib/customJobs/CustomJobRepository"
import {
   CustomJob,
   CustomJobApplicant,
   CustomJobStats,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { JobsInfo } from "@careerfairy/shared-lib/customJobs/service/UserBasedRecommendationsBuilder"
import { FieldOfStudyCategoryMap } from "@careerfairy/shared-lib/fieldOfStudy"
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
   UserLastViewedJob,
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

   getUserFeaturedGroups(user: UserData): Promise<Group[]>
   /**
    * Get the reference livestream if one was specified
    * @returns Promise containing the reference livestream or null if none was specified
    */
   getReferenceLivestream(): Promise<LivestreamEvent | null>
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

   async getUserFeaturedGroups(user: UserData): Promise<Group[]> {
      // Not implemented for newsletter, since data fetching would be per
      // user meaning an excess number requests would be made for each subscribed user
      throw new Error("Not implemented: " + user?.id)
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

   async getReferenceLivestream(): Promise<LivestreamEvent | null> {
      throw new Error("Not implemented")
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
      private readonly sparksRepo: ISparkFunctionsRepository,
      private readonly groupRepo: IGroupRepository,
      private readonly options: {
         /**
          * Reference livestream ID for similarity-based recommendations.
          * When provided, recommendations will prioritize livestreams matching
          * this one's industry and location.
          */
         referenceLivestreamId?: string
      } = {}
   ) {
      this.loader = new BundleLoader()
   }

   /**
    * Fetches the reference livestream if an ID was provided.
    * Used by the recommendation engine to prioritize similar events.
    *
    * @returns The reference livestream or null if none was specified
    */
   async getReferenceLivestream(): Promise<LivestreamEvent | null> {
      if (!this.options.referenceLivestreamId) return null
      return this.livestreamRepo.getById(this.options.referenceLivestreamId)
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

   async getUserFeaturedGroups(user: UserData): Promise<Group[]> {
      if (!user?.fieldOfStudy?.id || !user?.countryIsoCode) return []

      const featuredGroupsByCountry =
         (await this.groupRepo.getFeaturedGroups(user.countryIsoCode)) ?? []

      return featuredGroupsByCountry.filter((group) =>
         group.featured?.targetAudience?.includes(
            FieldOfStudyCategoryMap[user.fieldOfStudy.id]
         )
      )
   }
}

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
      return this.livestreamRepo.getParticipatedEvents(this.userId, 5)
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

export class CustomJobDataFetcher {
   constructor(
      private readonly userId: string,
      private readonly referenceJobId: string,
      private readonly userRepo: IUserRepository,
      private readonly customJobRepo: ICustomJobRepository,
      private readonly livestreamRepo: ILivestreamRepository
   ) {}

   getUser(): Promise<UserData> {
      if (!this.userId) return Promise.resolve(null)
      return this.userRepo.getUserDataById(this.userId)
   }

   getUserAppliedJobs(limit: number): Promise<CustomJobApplicant[]> {
      if (!this.userId) return Promise.resolve([])
      return this.userRepo.getCustomJobApplications(this.userId, limit)
   }

   getFutureJobs(): Promise<CustomJob[]> {
      return this.customJobRepo.getPublishedCustomJobs()
   }

   getReferenceJob(): Promise<CustomJob> {
      if (!this.referenceJobId) return Promise.resolve(null)
      return this.customJobRepo.getCustomJobById(this.referenceJobId)
   }

   getJobStats(jobIds: string[]): Promise<CustomJobStats[]> {
      if (!jobIds?.length) return Promise.resolve([])
      return this.customJobRepo.getCustomJobStats(jobIds)
   }

   getUserRegisteredLivestreams(limit: number): Promise<LivestreamEvent[]> {
      if (!this.userId) return Promise.resolve([])
      return this.livestreamRepo.getRegisteredEvents(this.userId, {
         limit,
      })
   }

   getUserStudyBackgrounds(): Promise<StudyBackground[]> {
      if (!this.userId) return Promise.resolve([])
      return this.userRepo.getUserStudyBackgrounds(this.userId)
   }

   getUserFollowingCompanies(): Promise<CompanyFollowed[]> {
      if (!this.userId) return Promise.resolve([])
      return this.userRepo.getCompaniesUserFollows(this.userId)
   }

   getUserLastViewedJobs(limit: number): Promise<UserLastViewedJob[]> {
      if (!this.userId) return Promise.resolve([])
      return this.userRepo.getUserLastViewedJobs(this.userId, limit)
   }

   getUserSavedJobs(limit: number): Promise<CustomJob[]> {
      if (!this.userId) return Promise.resolve([])
      return this.userRepo.getSavedJobs(this.userId, limit)
   }

   /**
    * Preferring to only return counts as to not keep too much the data in memory.
    */
   async getCustomJobsInfo(customJobs: CustomJob[]): Promise<JobsInfo> {
      if (!customJobs?.length) return Promise.resolve(null)
      const jobsInfo: JobsInfo = {}

      const upcomingEventIds = await this.livestreamRepo
         .getUpcomingEvents()
         .then((events) => events.map((event) => event.id))
      customJobs.forEach((job) => {
         const linkedUpcomingEventsCount = job.livestreams.filter(
            (livestream) => upcomingEventIds.includes(livestream)
         ).length
         jobsInfo[job.id] = {
            linkedUpcomingEventsCount,
         }
      })

      return jobsInfo
   }
}
