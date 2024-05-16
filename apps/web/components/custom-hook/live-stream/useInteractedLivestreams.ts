import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { UserData } from "@careerfairy/shared-lib/users"
import { useMemo } from "react"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

/**
 * Fetches the latest user interacted livestreams, which includes participated livestreams or
 * livestreams which the user has seen a recording of.
 * @param limit Limit of the items to fetch.
 * @returns LivestreamEvent[] Collection of the latest livestreams for which the user has had an interaction.
 */
const useInteractedLivestreams = (userData: UserData, limit: number = 10) => {
   const fetcher = useFunctionsSWR()

   const key = userData
      ? [
           "getInteractedLivestreams",
           {
              limit: limit,
           },
        ]
      : null

   const {
      data: interactedEvents,
      error,
      isLoading,
   } = useSWR<LivestreamEvent[]>(key, fetcher, {
      onError: (error, key) =>
         errorLogAndNotify(error, {
            message:
               "Error Fetching user Interacted Live streams via cloud function",
            key,
         }),
      ...reducedRemoteCallsOptions,
      suspense: false,
   })

   return useMemo(
      () => ({
         events: interactedEvents,
         loading: isLoading,
         error: error,
      }),
      [error, isLoading, interactedEvents]
   )
}

export default useInteractedLivestreams
