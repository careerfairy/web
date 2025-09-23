import { FUNCTION_NAMES } from "@careerfairy/shared-lib/functions"
import { GetNearbyOfflineEventsRequest } from "@careerfairy/shared-lib/functions/types"
import { OfflineEvent } from "@careerfairy/shared-lib/offline-events/offline-events"
import useSWR from "swr"
import useFunctionsSWRFetcher, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

export const useNearbyOfflineEvents = (
   options: GetNearbyOfflineEventsRequest = {
      radiusInKm: 50,
      limit: 20,
   }
) => {
   const fetcher = useFunctionsSWRFetcher<OfflineEvent[]>()

   return useSWR<OfflineEvent[]>(
      [FUNCTION_NAMES.getNearbyOfflineEvents, options],
      fetcher,
      {
         ...reducedRemoteCallsOptions,
         suspense: false,
      }
   )
}
