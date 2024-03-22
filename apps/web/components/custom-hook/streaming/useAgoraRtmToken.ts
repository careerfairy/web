import { livestreamService } from "data/firebase/LivestreamService"
import { errorLogAndNotify } from "util/CommonUtil"
import useSWRImmutable from "swr/immutable"

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
   const key = agoraUid ? `get-agora-rtm-token-${agoraUid}` : null

   const {
      data: token,
      isValidating: tokenIsValidating,
      error: tokenError,
      mutate,
      isLoading,
   } = useSWRImmutable(
      key,
      () => livestreamService.fetchAgoraRtmToken(agoraUid),
      {
         onError: (error, key) => {
            return errorLogAndNotify(error, {
               message: "Failed to fetch Agora RTM token",
               args: key,
            })
         },
      }
   )

   return {
      token,
      isLoading: tokenIsValidating || isLoading,
      isError: Boolean(tokenError),
      reFetchToken: mutate,
   }
}
