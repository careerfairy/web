import {
   IRecommendationCustomJobsService,
   RecommendationCustomJobsServiceCore,
} from "@careerfairy/shared-lib/customJobs/IRecommendationCustomJobsService"
import {
   JobsData,
   UserProfile,
} from "@careerfairy/shared-lib/customJobs/service/UserBasedRecommendationsBuilder"

import { Logger } from "@careerfairy/shared-lib/utils/types"
import { CustomJobDataFetcher } from "./services/DataFetcherRecommendations"

const MAX_USER_APPLIED_JOBS = 20
const MAX_USER_REGISTERED_LIVESTREAMS = 10
const MAX_USER_LAST_VIEWED_JOBS = 20
const MAX_USER_SAVED_JOBS = 10

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

      return this.process(rankedCustomJobs, limit)
   }

   static async create(
      dataFetcher: CustomJobDataFetcher,
      logger: Logger
   ): Promise<IRecommendationCustomJobsService> {
      const userData = await dataFetcher.getUser()

      const [
         userAppliedJobs,
         customJobs,
         referenceJob,
         userRegisteredLivestreams,
         userStudyBackgrounds,
         userFollowingCompanies,
         userLastViewedJobs,
         userSavedJobs,
      ] = await Promise.all([
         dataFetcher.getUserAppliedJobs(MAX_USER_APPLIED_JOBS),
         dataFetcher.getFutureJobs(),
         dataFetcher.getReferenceJob(),
         dataFetcher.getUserRegisteredLivestreams(
            MAX_USER_REGISTERED_LIVESTREAMS
         ),
         dataFetcher.getUserStudyBackgrounds(),
         dataFetcher.getUserFollowingCompanies(),
         dataFetcher.getUserLastViewedJobs(MAX_USER_LAST_VIEWED_JOBS),
         dataFetcher.getUserSavedJobs(MAX_USER_SAVED_JOBS),
      ])

      const jobsInfo = await dataFetcher.getCustomJobsInfo(customJobs)
      logger.info("🚀 ~ jobsInfo:", jobsInfo)

      const userProfile: UserProfile = {
         userData,
         jobApplications: userAppliedJobs,
         registeredLivestreams: userRegisteredLivestreams,
         studyBackgrounds: userStudyBackgrounds,
         followingCompanies: userFollowingCompanies,
         lastViewedJobs: userLastViewedJobs,
         savedJobs: userSavedJobs,
      }

      // Remove jobs that the user has already applied to
      // Not removing during test
      // const filteredJobs = customJobs?.filter( job => !userAppliedJobs?.some( appliedJob => appliedJob.job?.id === job.id)) ?? []

      logger.info(
         "🚀 ~ userSavedJobs: CustomJobRecommendationService.create ~ userSavedJobs:",
         userSavedJobs?.map((job) => job.id)
      )
      const jobsData: JobsData = {
         customJobs,
         referenceJob,
         stats: {},
         jobsInfo,
      }

      return new CustomJobRecommendationService(userProfile, jobsData, logger)
   }
}
