import {
   CustomJob,
   sortCustomJobs,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import { useRouter } from "next/router"
import { useCallback, useMemo } from "react"
import useGroupCustomJobsStats from "../../../../custom-hook/custom-job/useGroupCustomJobsStats"
import useGroupFromState from "../../../../custom-hook/useGroupFromState"
import EmptyJobsView from "../../../admin/jobs/empty-jobs-view/EmptyJobsView"
import JobList from "./JobList"

const JobsContent = () => {
   const { group } = useGroupFromState()
   const allJobsWithStats = useGroupCustomJobsStats(group.groupId, {
      deletedJobs: false,
   })
   const { push } = useRouter()
   const { jobHubV1 } = useFeatureFlags()

   const sortedJobs = useMemo(
      () => (jobHubV1 ? sortCustomJobs(allJobsWithStats) : allJobsWithStats),
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
