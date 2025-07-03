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
   public readonly USER_BUSINESS_FUNCTIONS_POINTS = 2
   public readonly USER_APPLIED_JOBS_BUSINESS_FUNCTIONS_POINTS = 1.5
   public readonly USER_JOB_LOCATION_POINTS = 5
   public readonly USER_COUNTRIES_OF_INTEREST_POINTS = 1
   public readonly USER_FOLLOWING_COMPANIES_POINTS = 3
   public readonly USER_LAST_VIEWED_JOBS_LOCATIONS_POINTS = 2.5
   public readonly USER_LAST_VIEWED_JOBS_INDUSTRIES_POINTS = 1.5
   public readonly USER_LAST_REGISTERED_LIVESTREAMS_INDUSTRIES_POINTS = 0.5
   public readonly USER_LAST_VIEWED_JOBS_BUSINESS_FUNCTIONS_POINTS = 0.5
   public readonly USER_SAVED_JOBS_POINTS = 2

   // from referenceJob
   public readonly REFERENCE_JOB_TYPE_POINTS = 0.5
   public readonly REFERENCE_JOB_BUSINESS_FUNCTIONS_POINTS = 1
   public readonly REFERENCE_JOB_LOCATION_POINTS = 1
   public readonly REFERENCE_JOB_INDUSTRY_POINTS = 1.5

   // from jobsInfo
   public readonly JOB_LINKED_UPCOMING_EVENTS_COUNT_POINTS = 4
   public readonly JOB_DEADLINE_ONE_WEEK_POINTS = 8
   public readonly JOB_DEADLINE_TWO_WEEKS_POINTS = 2
   public readonly JOB_DEADLINE_ONE_MONTH_POINTS = 0.5
   public readonly JOB_PUBLISHING_DATE_TWO_WEEKS_POINTS = 4

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

   public getCustomJobsBasedOnBusinessFunctionTagIds(
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

   public getCustomJobsBasedOnCondition(
      condition: (job: RankedCustomJob) => boolean,
      pointsPerMatch: number,
      pointsMultiplier: number | ((job: RankedCustomJob) => number) = 1
   ): RankedCustomJob[] {
      const jobs = this.customJobs.filter(condition)
      return this.applyRank(jobs, pointsPerMatch, pointsMultiplier)
   }

   private applyRank(
      rankedCustomJobs: RankedCustomJob[],
      points: number,
      pointsMultiplier: number | ((job: RankedCustomJob) => number) = 1
   ): RankedCustomJob[] {
      rankedCustomJobs.forEach((rankedCustomJob) => {
         const multiplier =
            typeof pointsMultiplier === "function"
               ? pointsMultiplier(rankedCustomJob)
               : pointsMultiplier
         rankedCustomJob.addPoints(points * multiplier)
      })
      return sortRankedByPoints<RankedCustomJob>(rankedCustomJobs)
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
