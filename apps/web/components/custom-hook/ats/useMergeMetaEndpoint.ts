import {
   MergeMetaEntities,
   MergeMetaResponse,
} from "@careerfairy/shared-lib/ats/merge/MergeResponseTypes"
import { useMemo } from "react"
import useSWR from "swr"
import useFunctionsSWRFetcher, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

/**
 * Fetch a single or multiple entities meta information from Merge
 * @param groupId
 * @param integrationId
 * @param entity
 */
const useMergeMetaEndpoint = (
   groupId: string,
   integrationId: string,
   entity: MergeMetaEntities[]
): MergeMetaResponse[] => {
   const fetcher = useFunctionsSWRFetcher<MergeMetaResponse>()

   const calls = useMemo(() => {
      return entity.map((entity) => [
         "mergeMetaEndpoint_eu",
         {
            groupId,
            integrationId,
            entity,
         },
      ])
   }, [entity, groupId, integrationId])

   const { data } = useSWR<MergeMetaResponse | MergeMetaResponse[]>(
      calls,
      fetcher,
      reducedRemoteCallsOptions
   )

   if (Array.isArray(data)) {
      return data
   }

   return [data]
}

export default useMergeMetaEndpoint
