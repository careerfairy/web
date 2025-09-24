import { OfflineEvent } from "@careerfairy/shared-lib/offline-events/offline-events"
import { offlineEventService } from "data/firebase/OfflineEventService"
import useSWR from "swr"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"

export const useOfflineEvents = () => {
   return useSWR<OfflineEvent[]>(
      ["offline-events"],
      async () => {
         return offlineEventService.getOfflineEvents()
      },
      {
         ...reducedRemoteCallsOptions,
         suspense: false,
      }
   )
}
