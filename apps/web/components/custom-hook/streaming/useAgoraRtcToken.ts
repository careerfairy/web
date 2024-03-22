import { AgoraRTCTokenRequest } from "@careerfairy/shared-lib/agora/token"
import { livestreamService } from "data/firebase/LivestreamService"
import { SWRConfiguration } from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import { useAuth } from "HOCs/AuthProvider"
import { useMemo } from "react"
import useSWRImmutable from "swr/immutable"

export type UseAgoraRtcToken = {
   /** The Agora RTC token */
   token: string
   /** Whether the data is loading */
   isLoading: boolean
   /** Whether there was an error fetching the data */
   isError: boolean
   /** Fetch the Agora RTC token */
   reFetchToken: () => Promise<string>
}

/**
 * Custom hook to manage the Agora RTC token.
 * @param {object} args - The data required to fetch the RTC token.
 * @returns {UseAgoraRtcToken} The Agora RTC token and a function to fetch it.
 */
export const useAgoraRtcToken = (
   args: AgoraRTCTokenRequest
): UseAgoraRtcToken => {
   const { authenticatedUser } = useAuth()

   const key = args ? `get-agora-rtc-token-${JSON.stringify(args)}` : null

   const options = useMemo<SWRConfiguration>(
      () => ({
         onError: (error, key) => {
            return errorLogAndNotify(error, {
               message: "Failed to fetch Agora RTC token",
               userUid: authenticatedUser?.uid,
               args: key,
            })
         },
      }),
      [authenticatedUser?.uid]
   )

   const {
      data: token,
      isValidating: tokenIsValidating,
      error: tokenError,
      mutate,
      isLoading,
   } = useSWRImmutable(
      key,
      () => livestreamService.fetchAgoraRtcToken(args),
      options
   )

   return {
      token,
      isLoading: tokenIsValidating || isLoading,
      isError: Boolean(tokenError),
      reFetchToken: mutate,
   }
}
