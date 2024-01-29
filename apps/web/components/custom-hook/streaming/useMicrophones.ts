import { type IAgoraRTCError } from "agora-rtc-react"
import { isServer } from "components/helperFunctions/HelperFunctions"
import { getAgoraRTC } from "components/views/streaming-page/util"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"

const fetcher = async () => {
   if (isServer()) return []
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
