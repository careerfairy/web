import {
   CustomJob,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import DateUtil from "util/DateUtil"

const useIsJobExpired = (job: CustomJob | PublicCustomJob): boolean => {
   return job.deadline && DateUtil.isDeadlineExpired(job.deadline.toDate())
}

export default useIsJobExpired
