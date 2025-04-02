import { FirebaseInArrayLimit } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { livestreamService } from "data/firebase/LivestreamService"
import { useEffect, useMemo } from "react"
import useSWR, { preload } from "swr"
import { useAuth } from "../../HOCs/AuthProvider"
import { reducedRemoteCallsOptions } from "./utils/useFunctionsSWRFetcher"

type Config = {
   limit?: FirebaseInArrayLimit
   suspense?: boolean
}

const useRecommendedEvents = (config?: Config) => {
   const { authenticatedUser } = useAuth()

   const limit = config?.limit || 10
   const suspense = config?.suspense || false

   const { data: events, isLoading } = useSWR<LivestreamEvent[]>(
      authenticatedUser.email
         ? ["getRecommendedEvents", limit, authenticatedUser.email]
         : null,
      async () =>
         livestreamService.getRecommendedEvents(limit, authenticatedUser.email),
      {
         ...reducedRemoteCallsOptions,
         suspense,
      }
   )

   return useMemo(
      () => ({
         events,
         loading: isLoading,
      }),
      [events, isLoading]
   )
}

type PreFetchConfig = {
   limit?: FirebaseInArrayLimit
}
/*
 * Hook to preload the recommended eventIds and store them in the SWR cache
 * */
export const usePreFetchRecommendedEvents = (config?: PreFetchConfig) => {
   const limit = config?.limit || 10
   const { isLoggedIn } = useAuth()
   const { authenticatedUser } = useAuth()

   useEffect(() => {
      // Only preload if the user is logged in, otherwise the function will throw a not authed error
      if (isLoggedIn) {
         preload(["getRecommendedEvents", limit, authenticatedUser.email], () =>
            livestreamService.getRecommendedEvents(
               limit,
               authenticatedUser.email
            )
         )
      }
   }, [limit, isLoggedIn, authenticatedUser.email])

   return null
}

export default useRecommendedEvents
