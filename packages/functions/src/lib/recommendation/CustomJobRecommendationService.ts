import {
   IRecommendationCustomJobsService,
   RecommendationCustomJobsServiceCore,
} from "@careerfairy/shared-lib/customJobs/IRecommendationCustomJobsService"
import {
   JobStats,
   JobsData,
   UserProfile,
} from "@careerfairy/shared-lib/customJobs/service/UserBasedRecommendationsBuilder"

import { Logger } from "@careerfairy/shared-lib/utils/types"
import { CustomJobDataFetcher } from "./services/DataFetcherRecommendations"

const MAX_USER_APPLIED_JOBS = 10

export class CustomJobRecommendationService
   extends RecommendationCustomJobsServiceCore
   implements IRecommendationCustomJobsService
{
   constructor(
      private readonly userProfile: UserProfile,
      private readonly jobsData: JobsData,
      logger: Logger
   ) {
      super(logger)
   }

   async getRecommendations(limit = 10): Promise<string[]> {
      const rankedCustomJobs = this.getRecommendedCustomJobsBasedOnUserData(
         limit,
         this.userProfile,
         this.jobsData
      )

      return rankedCustomJobs.map((job) => job.id)
   }

   static async create(
      dataFetcher: CustomJobDataFetcher,
      logger: Logger
   ): Promise<IRecommendationCustomJobsService> {
      const userData = await dataFetcher.getUser()

      const userAppliedJobsFetcher = userData
         ? dataFetcher.getUserAppliedJobs(MAX_USER_APPLIED_JOBS)
         : Promise.resolve([])

      const [userAppliedJobs, customJobs, referenceJob] = await Promise.all([
         userAppliedJobsFetcher,
         dataFetcher.getFutureJobs(),
         dataFetcher.getReferenceJob(),
      ])

      const customJobsStats = await dataFetcher.getJobStats(
         customJobs.map((job) => job.id)
      )

      const stats: JobStats = customJobsStats.reduce((acc, stat) => {
         acc[stat.id] = stat
         return acc
      }, {})

      const userProfile: UserProfile = {
         userData,
         jobApplications: userAppliedJobs,
      }

      const jobsData: JobsData = {
         customJobs,
         referenceJob,
         stats,
      }

      return new CustomJobRecommendationService(userProfile, jobsData, logger)
   }
}
