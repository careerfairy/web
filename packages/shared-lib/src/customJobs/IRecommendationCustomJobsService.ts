import { combineRankedDocuments } from "../BaseFirebaseRepository"
import { sortRankedByPoints } from "../recommendation/utils"
import { Logger } from "../utils/types"
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
      console.log(
         "🚀 ~ RecommendationCustomJobsServiceCore ~ getting recommendations"
      )
      const userRecommendationBuilder = new UserBasedRecommendationsBuilder(
         limit,
         new RankedCustomJobsRepository(jobsData.customJobs),
         userProfile,
         jobsData
      )

      return userRecommendationBuilder
         .userStudyBackgroundBusinessFunctionsTags()
         .userBusinessFunctionsTags()
         .userBusinessFunctionsTags()
         .get()
   }

   protected process(
      results: RankedCustomJob[] | RankedCustomJob[][],
      limit: number
   ): string[] {
      const combinedResults = combineRankedDocuments(results)
      console.log(
         "🚀 Combine results:",
         combinedResults.map((job) => job.id + " - " + job.points)
      )
      const sortedRecommendedCustomJobs =
         sortRankedByPoints<RankedCustomJob>(combinedResults)

      return sortedRecommendedCustomJobs.map((job) => job.id).slice(0, limit)
   }
}
