import { OfflineEventWithDistance } from "@careerfairy/shared-lib/offline-events/offline-events"
import { offlineEventService } from "data/firebase/OfflineEventService"
import { useAuth } from "HOCs/AuthProvider"
import useSWR from "swr"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"

export const useOfflineEvents = () => {
   const { userData, isLoadingUserData } = useAuth()

   // Only fetch when auth/userData is fully loaded
   const shouldFetch = !isLoadingUserData

   return useSWR<OfflineEventWithDistance[]>(
      shouldFetch
         ? ["offline-events", userData?.stateIsoCode, userData?.countryIsoCode]
         : null, // null key prevents fetching
      async () => {
         // Pass user's profile location if available
         const userLocation =
            userData?.stateIsoCode && userData?.countryIsoCode
               ? {
                    stateIsoCode: userData.stateIsoCode,
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
