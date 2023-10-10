import {
   LivestreamCustomJobAssociationPresenter,
   LivestreamJobAssociation,
} from "@careerfairy/shared-lib/livestreams"

const useIsAtsLivestreamJobAssociation = (
   job: LivestreamJobAssociation | LivestreamCustomJobAssociationPresenter
): job is LivestreamJobAssociation => {
   return "integrationId" in job
}

export default useIsAtsLivestreamJobAssociation
