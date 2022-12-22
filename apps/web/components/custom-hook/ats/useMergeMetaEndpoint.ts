import useSWR from "swr"
import {
   MergeMetaEntities,
   MergeMetaResponse,
} from "@careerfairy/shared-lib/dist/ats/merge/MergeResponseTypes"
import useFunctionsSWRFetcher, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

const useMergeMetaEndpoint = (
   groupId: string,
   integrationId: string,
   entity: MergeMetaEntities
): MergeMetaResponse => {
   const fetcher = useFunctionsSWRFetcher<MergeMetaResponse>()

   const { data } = useSWR(
      [
         "mergeMetaEndpoint",
         {
            groupId,
            integrationId,
            entity,
         },
      ],
      fetcher,
      reducedRemoteCallsOptions
   )

   return data
}

export default useMergeMetaEndpoint
