import { Job } from "@careerfairy/shared-lib/ats/Job"
import { PublicCustomJob } from "@careerfairy/shared-lib/groups/customJobs"

const useIsAtsJob = (job: Job | PublicCustomJob): job is Job => {
   return "getHiringManager" in job
}

export default useIsAtsJob
