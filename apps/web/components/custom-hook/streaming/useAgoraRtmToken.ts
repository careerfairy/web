import { livestreamService } from "data/firebase/LivestreamService"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"
import { errorLogAndNotify } from "util/CommonUtil"
import useSWR from "swr"

export type UseAgoraRtmToken = {
   /** The Agora RTM token */
   token: string
   /** Whether the data is loading */
   isLoading: boolean
   /** Whether there was an error fetching the data */
   isError: boolean
   /** Fetch the Agora RTM token */
   reFetchToken: () => Promise<string>
}

/**
 * Custom hook to manage the Agora RTM token.
 * @returns {UseAgoraRtmToken} The Agora RTM token and a function to fetch it.
 */
export const useAgoraRtmToken = (agoraUid: string): UseAgoraRtmToken => {
   const key = agoraUid || null

   const {
      data: token,
      isValidating: tokenIsValidating,
      error: tokenError,
      mutate,
      isLoading,
   } = useSWR(key, () => livestreamService.fetchAgoraRtmToken(agoraUid), {
      /**
       * Token is only re-fetched when the args change
       * Not on focus, blur, or other events
       */
      ...reducedRemoteCallsOptions,
      onError: (error, key) => {
         return errorLogAndNotify(error, {
            message: "Failed to fetch Agora RTM token",
            args: key,
         })
      },
      suspense: false,
   })

   return {
      token,
      isLoading: tokenIsValidating || isLoading,
      isError: Boolean(tokenError),
      reFetchToken: mutate,
   }
}
