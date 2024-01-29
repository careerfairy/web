import { type IAgoraRTCError } from "agora-rtc-react"
import { getAgoraRTC } from "components/views/streaming-page/util"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"

const fetcher = async () => {
   const AgoraRTC = await getAgoraRTC()
   return AgoraRTC.getMicrophones()
}
export const useMicrophones = (shouldFetch: boolean) => {
   return useSWR<MediaDeviceInfo[], IAgoraRTCError>(
      shouldFetch ? "microphones" : null,
      fetcher,
      {
         onError: errorLogAndNotify,
         fallbackData: [],
      }
   )
}
