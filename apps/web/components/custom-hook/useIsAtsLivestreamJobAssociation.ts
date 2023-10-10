import { PublicCustomJob } from "@careerfairy/shared-lib/groups/customJobs"
import { LivestreamJobAssociation } from "@careerfairy/shared-lib/livestreams"

const useIsAtsLivestreamJobAssociation = (
   job: LivestreamJobAssociation | PublicCustomJob
): job is LivestreamJobAssociation => {
   return "integrationId" in job
}

export default useIsAtsLivestreamJobAssociation
