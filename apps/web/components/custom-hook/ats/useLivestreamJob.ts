import { Job } from "@careerfairy/shared-lib/ats/Job"
import { LivestreamJobAssociation } from "@careerfairy/shared-lib/livestreams"
import useLivestreamJobs from "../useLivestreamJobs"

const useLivestreamJob = (job?: LivestreamJobAssociation): Job => {
   return useLivestreamJobs(undefined, job ? [job] : [])?.jobs[0]
}

export default useLivestreamJob
