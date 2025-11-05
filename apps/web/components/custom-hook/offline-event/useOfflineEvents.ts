import { OfflineEventWithDistance } from "@careerfairy/shared-lib/offline-events/offline-events"
import { offlineEventService } from "data/firebase/OfflineEventService"
import { useAuth } from "HOCs/AuthProvider"
import useSWR from "swr"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"

export const useOfflineEvents = () => {
   const { userData } = useAuth()

   return useSWR<OfflineEventWithDistance[]>(
      ["offline-events", userData?.stateName, userData?.countryIsoCode],
      async () => {
         // Pass user's profile location if available
         const userLocation =
            userData?.stateName && userData?.countryIsoCode
               ? {
                    stateName: userData.stateName,
                    countryIsoCode: userData.countryIsoCode,
                 }
               : undefined

         return offlineEventService.getOfflineEvents(userLocation)
      },
      {
         ...reducedRemoteCallsOptions,
         suspense: false,
      }
   )
}
