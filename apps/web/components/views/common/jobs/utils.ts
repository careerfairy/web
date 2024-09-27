import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import DateUtil from "util/DateUtil"

/**
 * Checks if a job has no linked content (live streams or sparks) and if its deadline has not expired.
 *
 */
export const isJobValidButNoLinkedContent = (job: CustomJob): boolean => {
   const jobLivestreams = job.livestreams || []
   const jobSparks = job.sparks || []

   const jobHasNoContent = jobLivestreams.length == 0 && jobSparks.length == 0

   return jobHasNoContent && !DateUtil.isDeadlineExpired(job.deadline.toDate())
}
