import { LivestreamJobAssociation } from "@careerfairy/shared-lib/livestreams"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"

const useIsAtsLivestreamJobAssociation = (
   job: LivestreamJobAssociation | CustomJob
): job is LivestreamJobAssociation => {
   return "integrationId" in job
}

export default useIsAtsLivestreamJobAssociation
