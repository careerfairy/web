import { AgoraTokenRequest } from "@careerfairy/shared-lib/agora/token"
import { livestreamService } from "data/firebase/LivestreamService"
import useSWR, { SWRConfiguration } from "swr"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"
import { errorLogAndNotify } from "util/CommonUtil"
import { useAuth } from "HOCs/AuthProvider"
import { useMemo } from "react"

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
export const useAgoraRtcToken = (args: AgoraTokenRequest): UseAgoraRtcToken => {
   const { authenticatedUser } = useAuth()
   const key = args
      ? [
           args.channelName,
           args.isStreamer,
           args.sentToken,
           args.streamDocumentPath,
           args.uid,
        ]
      : null

   const options = useMemo<SWRConfiguration>(
      () => ({
         ...reducedRemoteCallsOptions,
         /**
          * Since the Agora RTC Token returned from the cloud function has a life-time of 6 hours, we can safely
          * cache the token for 10 minutes to reduce our network footprint.
          */
         dedupingInterval: 600000, // 10 minutes
         focusThrottleInterval: 600000, // 10 minutes
         onError: (error, key) => {
            console.log("error", error)
            console.log("key", key)
            return errorLogAndNotify(error, {
               message: "Failed to fetch Agora RTC token",
               userUid: authenticatedUser?.uid,
               args: {
                  channelName: key[0],
                  isStreamer: key[1],
                  sentToken: key[2],
                  streamDocumentPath: key[3],
                  agoraUid: key[4],
               },
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
   } = useSWR(key, () => livestreamService.fetchAgoraRtcToken(args), options)

   return {
      token,
      isLoading: tokenIsValidating,
      isError: Boolean(tokenError),
      reFetchToken: mutate,
   }
}
