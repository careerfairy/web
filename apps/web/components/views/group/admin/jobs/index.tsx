import JobList from "./JobList"
import useGroupFromState from "../../../../custom-hook/useGroupFromState"
import EmptyJobsView from "../../../admin/jobs/empty-jobs-view/EmptyJobsView"
import useCustomJobsStats from "../../../../custom-hook/custom-job/useCustomJobsStats"

const JobsContent = () => {
   const { group } = useGroupFromState()
   const allJobsWithStats = useCustomJobsStats(group.groupId)

   return allJobsWithStats.length > 0 ? (
      <JobList jobsWithStats={allJobsWithStats} />
   ) : (
      <EmptyJobsView />
   )
}
export default JobsContent
