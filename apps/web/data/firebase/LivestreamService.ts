import {
   FilterLivestreamsOptions,
   LivestreamQueryOptions,
} from "@careerfairy/shared-lib/livestreams"
import { Functions, httpsCallable } from "firebase/functions"
import { mapFromServerSide } from "util/serverUtil"
import { FunctionsInstance } from "./FirebaseInstance"
import {
   AgoraTokenRequest,
   AgoraTokenResponse,
} from "@careerfairy/shared-lib/agora/token"

export class LivestreamService {
   constructor(private readonly functions: Functions) {}

   /**
    * Fetches livestreams with the given query options
    * @param data  The query options
    * */
   async fetchLivestreams(
      data: LivestreamQueryOptions & FilterLivestreamsOptions
   ) {
      const { data: serializedLivestreams } = await httpsCallable<
         typeof data,
         {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [field: string]: any
         }[]
      >(
         this.functions,
         "fetchLivestreams_v2"
      )(data)

      return mapFromServerSide(serializedLivestreams)
   }

   /**
    * Fetches an Agora RTC token with the given data
    * @param data The data required to fetch the RTC token
    * @returns A promise containing the Agora RTC token
    */
   async fetchAgoraRtcToken(data: AgoraTokenRequest) {
      const fetchAgoraRtcToken = httpsCallable<
         AgoraTokenRequest,
         AgoraTokenResponse
      >(this.functions, "fetchAgoraRtcToken_v2")

      const {
         data: { token },
      } = await fetchAgoraRtcToken(data)

      return token.rtcToken
   }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const livestreamService = new LivestreamService(FunctionsInstance as any)

export default LivestreamService
