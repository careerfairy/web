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
      super(logger, true)
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
         dataFetcher.getUserAppliedJobs(userData?.id, MAX_USER_APPLIED_JOBS),
         dataFetcher.getFutureJobs(),
         dataFetcher.getReferenceJob(),
         dataFetcher.getUserRegisteredLivestreams(
            userData?.id,
            MAX_USER_REGISTERED_LIVESTREAMS
         ),
         dataFetcher.getUserStudyBackgrounds(userData?.id),
         dataFetcher.getUserFollowingCompanies(userData?.id),
         dataFetcher.getUserLastViewedJobs(
            userData?.authId,
            MAX_USER_LAST_VIEWED_JOBS
         ),
         dataFetcher.getUserSavedJobs(userData?.id, MAX_USER_SAVED_JOBS),
      ])

      logger.info("🚀 ~ Total jobs:", customJobs?.length)

      const jobsInfo = await dataFetcher.getCustomJobsInfo(customJobs)

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
      const filteredJobs =
         customJobs?.filter(
            (job) =>
               !userAppliedJobs?.some(
                  (appliedJob) => appliedJob.job?.id === job.id
               )
         ) ?? []

      const jobsData: JobsData = {
         customJobs: filteredJobs,
         referenceJob,
         stats: {},
         jobsInfo,
      }

      return new CustomJobRecommendationService(userProfile, jobsData, logger)
   }
}
