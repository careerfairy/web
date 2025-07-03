import { combineRankedDocuments } from "../BaseFirebaseRepository"
import { sortRankedByPoints } from "../recommendation/utils"
import { Logger } from "../utils/types"
import { windowedShuffle } from "../utils/utils"
import { RankedCustomJob } from "./RankedCustomJob"
import { RankedCustomJobsRepository } from "./service/RankedCustomJobsRepository"
import {
   JobsData,
   UserBasedRecommendationsBuilder,
   UserProfile,
} from "./service/UserBasedRecommendationsBuilder"

export interface IRecommendationCustomJobsService {
   /**
    * Get recommendations for custom jobs
    * @param limit - The maximum number of recommendations to return
    * @returns A promise that resolves to an array of recommended custom job IDs
    */
   getRecommendations(limit?: number): Promise<string[]>
}

export class RecommendationCustomJobsServiceCore {
   constructor(protected log: Logger, protected debug: boolean = false) {}

   protected getRecommendedCustomJobsBasedOnUserData(
      limit: number,
      userProfile: UserProfile,
      jobsData: JobsData
   ): RankedCustomJob[] {
      const logger: Logger | null = this.debug ? this.log : null

      const userRecommendationBuilder = new UserBasedRecommendationsBuilder(
         limit,
         new RankedCustomJobsRepository(jobsData.customJobs),
         userProfile,
         jobsData,
         logger
      )

      return userRecommendationBuilder
         .userBusinessFunctionsTags()
         .userFollowingCompanies()
         .userStrictLocation()
         .userCountriesOfInterest()
         .userSavedJobs()
         .userLastViewedJobsLocations()
         .userLastViewedJobsBusinessFunctionsTags()
         .userLastViewedJobsIndustries()
         .userAppliedJobsBusinessFunctionsTags()
         .userLastRegisteredLivestreamsIndustries()
         .referenceJobBusinessFunctionsTags()
         .referenceJobType()
         .referenceJobLocation()
         .referenceJobIndustry()
         .jobLinkedUpcomingEventsCount()
         .jobDeadline()
         .jobPublishingDate()
         .get()
   }

   protected process(
      results: RankedCustomJob[] | RankedCustomJob[][],
      limit: number
   ): string[] {
      const combinedResults = combineRankedDocuments(results)

      const sortedRecommendedCustomJobs =
         sortRankedByPoints<RankedCustomJob>(combinedResults)

      const shuffledRecommendedCustomJobs = windowedShuffle(
         sortedRecommendedCustomJobs,
         10,
         2
      )

      if (this.debug) {
         this.log.info("🚀 All recommendation results (SORTED):", {
            points: sortedRecommendedCustomJobs.map(
               (job) => job.id + " - " + job.points
            ),
         })

         this.log.info("🚀 All recommendation results (SHUFFLED):", {
            points: shuffledRecommendedCustomJobs.map(
               (job) => job.id + " - " + job.points
            ),
         })
      }

      return shuffledRecommendedCustomJobs.map((job) => job.id).slice(0, limit)
   }
}
