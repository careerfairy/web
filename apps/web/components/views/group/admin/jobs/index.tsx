import JobList from "./JobList"
import useGroupFromState from "../../../../custom-hook/useGroupFromState"
import EmptyJobsView from "../../../admin/jobs/empty-jobs-view/EmptyJobsView"
import useCustomJobsStats from "../../../../custom-hook/useCustomJobsStats"

const JobsContent = () => {
   const { group } = useGroupFromState()
   const allJobsStats = useCustomJobsStats(group.groupId)

   return allJobsStats.length > 0 ? (
      <JobList jobsStats={allJobsStats} />
   ) : (
      <EmptyJobsView />
   )
}
export default JobsContent
