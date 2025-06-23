import {
   IRecommendationCustomJobsService,
   RecommendationCustomJobsServiceCore,
} from "@careerfairy/shared-lib/customJobs/IRecommendationCustomJobsService"
import {
   JobsData,
   UserProfile,
} from "@careerfairy/shared-lib/customJobs/service/UserBasedRecommendationsBuilder"
import { arrayToRecordById } from "@careerfairy/shared-lib/recommendation/utils"

import { Logger } from "@careerfairy/shared-lib/utils/types"
import { CustomJobDataFetcher } from "./services/DataFetcherRecommendations"

const MAX_USER_APPLIED_JOBS = 20
const MAX_USER_REGISTERED_LIVESTREAMS = 10

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
      ] = await Promise.all([
         dataFetcher.getUserAppliedJobs(MAX_USER_APPLIED_JOBS),
         dataFetcher.getFutureJobs(),
         dataFetcher.getReferenceJob(),
         dataFetcher.getUserRegisteredLivestreams(
            MAX_USER_REGISTERED_LIVESTREAMS
         ),
         dataFetcher.getUserStudyBackgrounds(),
         dataFetcher.getUserFollowingCompanies(),
      ])

      // Also include reference job id to get stats for it
      const jobIds = [
         ...new Set([...customJobs.map((job) => job.id), referenceJob?.id]),
      ]

      const stats = await dataFetcher
         .getJobStats(jobIds)
         .then(arrayToRecordById)

      const userProfile: UserProfile = {
         userData,
         jobApplications: userAppliedJobs,
         registeredLivestreams: userRegisteredLivestreams,
         studyBackgrounds: userStudyBackgrounds,
         followingCompanies: userFollowingCompanies,
      }

      const jobsData: JobsData = {
         customJobs,
         referenceJob,
         stats,
      }

      return new CustomJobRecommendationService(userProfile, jobsData, logger)
   }
}
