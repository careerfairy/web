import { CustomJobStats } from "@careerfairy/shared-lib/customJobs/customJobs"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import useGroupCustomJobsStats from "../../../../custom-hook/custom-job/useGroupCustomJobsStats"
import useGroupFromState from "../../../../custom-hook/useGroupFromState"
import EmptyJobsView from "../../../admin/jobs/empty-jobs-view/EmptyJobsView"
import JobList from "./JobList"

const JobsContent = () => {
   const { group } = useGroupFromState()
   const allJobsWithStats = useGroupCustomJobsStats(group.groupId)
   const { newJobHub } = useFeatureFlags()

   const sortedJobs = newJobHub ? sortJobs(allJobsWithStats) : allJobsWithStats

   return allJobsWithStats.length > 0 ? (
      <JobList jobsWithStats={sortedJobs} />
   ) : (
      <EmptyJobsView />
   )
}
export default JobsContent

/**
 *
 * This function sorts an array of job statistics.
 * It prioritizes jobs based on their publication status and deadline.
 *
 * @param jobs {CustomJobStats[]}
 * @returns jobs {CustomJobStats[]}
 */
const sortJobs = (jobs: CustomJobStats[]): CustomJobStats[] => {
   const now = new Date()

   return jobs.sort(({ job: jobA }, { job: jobB }) => {
      // Sort by 'published' flag
      if (jobA.published && !jobB.published) {
         return -1
      }
      if (!jobA.published && jobB.published) {
         return 1
      }

      // Both have the same 'published' status, so sort by 'deadline'
      const aDeadlineValid = jobA.deadline.toDate() > now
      const bDeadlineValid = jobB.deadline.toDate() > now

      if (aDeadlineValid && !bDeadlineValid) {
         return -1
      }
      if (!aDeadlineValid && bDeadlineValid) {
         return 1
      }

      // If both jobs have the same 'published' status and 'deadline' validity, maintain the current order
      return 0
   })
}
