import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { useMemo } from "react"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

const useInteractedLivestreams = (limit?: 10) => {
   const fetcher = useFunctionsSWR()

   const {
      data: interactedEvents,
      error,
      isLoading,
   } = useSWR<LivestreamEvent[]>(
      [
         "getInteractedLivestreams",
         {
            limit: limit,
         },
      ],
      fetcher,
      {
         onError: (error, key) =>
            errorLogAndNotify(error, {
               message:
                  "Error Fetching user Interacted Livestreams via function",
               key,
            }),
         ...reducedRemoteCallsOptions,
         suspense: false,
      }
   )

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
