import { AgoraRTMTokenRequest } from "@careerfairy/shared-lib/agora/token"
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
 * @param {object} args - The data required to fetch the RTM token.
 * @returns {UseAgoraRtmToken} The Agora RTM token and a function to fetch it.
 */
export const useAgoraRtmToken = (
   args: AgoraRTMTokenRequest
): UseAgoraRtmToken => {
   const key = args ? JSON.stringify(args) : null

   const {
      data: token,
      isValidating: tokenIsValidating,
      error: tokenError,
      mutate,
      isLoading,
   } = useSWR(key, () => livestreamService.fetchAgoraRtmToken(args), {
      /**
       * Token is only re-fetched when the args change
       * Not on focus, blur, or other events
       */
      ...reducedRemoteCallsOptions,
      onError: (error, key) => {
         console.log("error", error)
         console.log("key", key)
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
