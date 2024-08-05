import {
   CustomJob,
   CustomJobStats,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { useRouter } from "next/router"
import { useCallback, useMemo } from "react"
import useGroupCustomJobsStats from "../../../../custom-hook/custom-job/useGroupCustomJobsStats"
import useGroupFromState from "../../../../custom-hook/useGroupFromState"
import EmptyJobsView from "../../../admin/jobs/empty-jobs-view/EmptyJobsView"
import JobList from "./jobList"

const JobsContent = () => {
   const { group } = useGroupFromState()
   const allJobsWithStats = useGroupCustomJobsStats(group.groupId)
   // const { jobHubV1 } = useFeatureFlags()
   const { jobHubV1 } = { jobHubV1: true }
   const { push } = useRouter()

   const sortedJobs = useMemo(
      () => (jobHubV1 ? sortJobs(allJobsWithStats) : allJobsWithStats),
      [allJobsWithStats, jobHubV1]
   )

   const handleJobClick = useCallback(
      ({ id }: CustomJob) => {
         void push(`/group/${group.groupId}/admin/jobs/${id}`)
      },
      [group.groupId, push]
   )

   return sortedJobs.length > 0 ? (
      <JobList jobWithStats={sortedJobs} handCLick={handleJobClick} />
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

   // Create a new array to avoid mutating the original 'jobs' array
   const sortedJobs = [...jobs]

   return sortedJobs.sort(({ job: jobA }, { job: jobB }) => {
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
