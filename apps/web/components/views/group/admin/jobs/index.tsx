import {
   CustomJob,
   sortCustomJobs,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { useRouter } from "next/router"
import { useCallback, useMemo } from "react"
import useGroupCustomJobsStats from "../../../../custom-hook/custom-job/useGroupCustomJobsStats"
import useGroupFromState from "../../../../custom-hook/useGroupFromState"
import EmptyJobsView from "../../../admin/jobs/empty-jobs-view/EmptyJobsView"
import JobList from "./JobList"

const JobsContent = () => {
   const { group } = useGroupFromState()
   const allJobsWithStats = useGroupCustomJobsStats(group.id, {
      deletedJobs: false,
   })
   const { push } = useRouter()

   const sortedJobs = useMemo(
      () => sortCustomJobs(allJobsWithStats),
      [allJobsWithStats]
   )

   const handleJobClick = useCallback(
      ({ id }: CustomJob) => {
         void push(`/group/${group.id}/admin/jobs/${id}`)
      },
      [group.id, push]
   )

   return sortedJobs.length > 0 ? (
      <JobList jobWithStats={sortedJobs} handCLick={handleJobClick} />
   ) : (
      <EmptyJobsView />
   )
}
export default JobsContent
