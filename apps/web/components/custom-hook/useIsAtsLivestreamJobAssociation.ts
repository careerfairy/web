import { LivestreamJobAssociation } from "@careerfairy/shared-lib/livestreams"
import {
   CustomJob,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"

const useIsAtsLivestreamJobAssociation = (
   job: LivestreamJobAssociation | CustomJob | PublicCustomJob
): job is LivestreamJobAssociation => {
   return "integrationId" in job
}

export default useIsAtsLivestreamJobAssociation
