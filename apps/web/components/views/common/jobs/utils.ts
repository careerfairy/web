import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import DateUtil from "util/DateUtil"

/**
 * Checks if a job has no linked content (live streams or sparks) and if its deadline has not expired.
 *
 */
export const isJobValidButNoLinkedContent = (job: CustomJob): boolean => {
   const jobHasNoContent = job.livestreams.length == 0 && job.sparks.length == 0

   return jobHasNoContent && !DateUtil.isDeadlineExpired(job.deadline.toDate())
}
