import { filterByField, sortRankedByPoints } from "../../recommendation/utils"
import { RankedCustomJob } from "../RankedCustomJob"
import { CustomJob, JobType } from "../customJobs"

type RankCustomJobArgs = {
   rankedCustomJobs: RankedCustomJob[]
   targetIds: unknown[]
   targetCustomJobIdsGetter: (stream: RankedCustomJob) => string[]
   pointsPerMatch: number
}
export class RankedCustomJobsRepository {
   // from userData
   public readonly USER_BUSINESS_FUNCTIONS = 1
   public readonly USER_APPLIED_JOBS_BUSINESS_FUNCTIONS = 0.5
   public readonly USER_SB_BUSINESS_FUNCTIONS = 0.5
   public readonly USER_JOB_LOCATION = 0.5
   public readonly USER_COUNTRIES_OF_INTEREST = 0.5
   public readonly USER_FOLLOWING_COMPANIES = 0.5
   public readonly USER_LAST_VIEWED_JOBS_LOCATIONS = 0.5
   public readonly USER_LAST_VIEWED_JOBS_INDUSTRIES = 0.5
   public readonly USER_LAST_REGISTERED_LIVESTREAMS_INDUSTRIES = 0.5

   // from referenceJob
   public readonly REFERENCE_JOB_TYPE = 0.5
   public readonly REFERENCE_JOB_BUSINESS_FUNCTIONS = 0.5
   public readonly REFERENCE_JOB_LOCATION = 0.5

   private readonly customJobs: RankedCustomJob[]

   constructor(jobs: CustomJob[]) {
      this.customJobs = jobs.map(RankedCustomJob.create)
   }

   public getRankedCustomJobs(): RankedCustomJob[] {
      return this.customJobs
   }

   public getCustomJobsBasedOnJobIndustries(
      industries: string[],
      pointsPerMatch: number
   ): RankedCustomJob[] {
      const jobs = filterByField(
         this.customJobs,
         (rankedJob: RankedCustomJob) => rankedJob.model?.group,
         "companyIndustries",
         industries
      )

      return this.rankCustomJobs({
         rankedCustomJobs: jobs,
         targetIds: industries,
         targetCustomJobIdsGetter: (rankedCustomJob) =>
            rankedCustomJob.model.group?.companyIndustries?.map(
               (industry) => industry.id
            ) ?? [],
         pointsPerMatch,
      })
   }

   public getCustomJobsBasedOnGroupIds(
      groupIds: string[],
      pointsPerMatch: number
   ): RankedCustomJob[] {
      const jobs = filterByField(
         this.customJobs,
         (rankedJob: RankedCustomJob) => rankedJob.model,
         "groupId",
         groupIds
      )

      return this.rankCustomJobs({
         rankedCustomJobs: jobs,
         targetIds: groupIds,
         targetCustomJobIdsGetter: (rankedCustomJob) => [
            rankedCustomJob.model.groupId,
         ],
         pointsPerMatch,
      })
   }

   /**
    * TODO: needs improvement, as filtering based on countries should take into account the state and city.
    */
   public getCustomJobsBasedOnLocations(
      locations: string[],
      pointsPerMatch: number
   ): RankedCustomJob[] {
      const jobs = filterByField(
         this.customJobs,
         (rankedJob: RankedCustomJob) => rankedJob.model,
         "jobLocation",
         locations
      )

      return this.rankCustomJobs({
         rankedCustomJobs: jobs,
         targetIds: locations,
         targetCustomJobIdsGetter: (rankedCustomJob) =>
            rankedCustomJob.model?.jobLocation?.map(
               (location) => location.id
            ) ?? [],
         pointsPerMatch,
      })
   }

   public getCustomJobsBasedOnJobTypes(
      types: JobType[],
      pointsPerMatch: number
   ): RankedCustomJob[] {
      const jobs = filterByField(
         this.customJobs,
         (rankedJob: RankedCustomJob) => rankedJob.model,
         "jobType",
         types
      )

      return this.rankCustomJobs({
         rankedCustomJobs: jobs,
         targetIds: types,
         targetCustomJobIdsGetter: (rankedCustomJob) =>
            rankedCustomJob.model.jobType
               ? [rankedCustomJob.model.jobType]
               : [],
         pointsPerMatch,
      })
   }

   public getCustomJobsBusinessFunctionTagIds(
      businessFunctionTagIds: string[],
      pointsPerMatch: number
   ): RankedCustomJob[] {
      const jobs = filterByField(
         this.customJobs,
         (rankedJob: RankedCustomJob) => rankedJob.model,
         "businessFunctionsTagIds",
         businessFunctionTagIds
      )

      return this.rankCustomJobs({
         rankedCustomJobs: jobs,
         targetIds: businessFunctionTagIds,
         targetCustomJobIdsGetter: (rankedCustomJob) =>
            rankedCustomJob.model.businessFunctionsTagIds,
         pointsPerMatch,
      })
   }

   private rankCustomJobs({
      rankedCustomJobs,
      targetIds,
      targetCustomJobIdsGetter,
      pointsPerMatch,
   }: RankCustomJobArgs): RankedCustomJob[] {
      rankedCustomJobs.forEach((rankedCustomJob) => {
         const targetCustomJobIds = targetCustomJobIdsGetter(rankedCustomJob)

         const numMatches = targetCustomJobIds.filter((customJobDataId) =>
            targetIds.includes(customJobDataId)
         ).length

         rankedCustomJob.addPoints(numMatches * pointsPerMatch)
      })

      return sortRankedByPoints<RankedCustomJob>(rankedCustomJobs)
   }
}
