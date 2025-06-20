import { filterByField, sortRankedByPoints } from "../../recommendation/utils"
import { RankedCustomJob } from "../RankedCustomJob"
import { CustomJob } from "../customJobs"

type RankCustomJobArgs = {
   rankedCustomJobs: RankedCustomJob[]
   targetIds: unknown[]
   targetCustomJobIdsGetter: (stream: RankedCustomJob) => string[]
   pointsPerMatch: number
}
export class RankedCustomJobsRepository {
   // from userData
   private readonly pointsPerTargetedCountryMatch = 5
   private readonly pointsPerTargetedFieldOfStudyMatch = 5
   private readonly pointsPerTargetedUniversityMatch = 2

   private readonly pointsPerBusinessFunctionTagMatch = 1
   private readonly pointsPerAppliedJobsBusinessFunctionTagMatch = 0.5

   private readonly customJobs: RankedCustomJob[]

   constructor(jobs: CustomJob[]) {
      this.customJobs = jobs.map(RankedCustomJob.create)
   }

   public getCustomJobsBasedOnUserBusinessFunctionTagIds(
      businessFunctionTagIds: string[]
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
         pointsPerMatch: this.pointsPerBusinessFunctionTagMatch,
      })
   }

   public getCustomJobsBasedOnUserAppliedJobsBusinessFunctionTagIds(
      businessFunctionTagIds: string[]
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
         pointsPerMatch: this.pointsPerAppliedJobsBusinessFunctionTagMatch,
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
