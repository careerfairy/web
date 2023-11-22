import useGroupCustomJobs from "../../../../custom-hook/useGroupCustomJobs"
import JobList from "./JobList"
import useGroupFromState from "../../../../custom-hook/useGroupFromState"
import EmptyJobsView from "../../../admin/jobs/empty-jobs-view/EmptyJobsView"

const JobsContent = () => {
   const { group } = useGroupFromState()
   const allJobs = useGroupCustomJobs(group.groupId)

   return allJobs.length > 0 ? <JobList /> : <EmptyJobsView />
}
export default JobsContent
