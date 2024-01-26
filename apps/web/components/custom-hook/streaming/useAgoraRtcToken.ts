import { AgoraTokenRequest } from "@careerfairy/shared-lib/agora/token"
import { livestreamService } from "data/firebase/LivestreamService"
import useSWR from "swr"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"

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
   const key = args
      ? [
           args.channelName,
           args.isStreamer,
           args.sentToken,
           args.streamDocumentPath,
           args.uid,
        ]
      : null

   const {
      data: token,
      isValidating: tokenIsValidating,
      error: tokenError,
      mutate,
   } = useSWR(
      key,
      () => livestreamService.fetchAgoraRtcToken(args),
      reducedRemoteCallsOptions
   )

   return {
      token,
      isLoading: tokenIsValidating,
      isError: Boolean(tokenError),
      reFetchToken: mutate,
   }
}
