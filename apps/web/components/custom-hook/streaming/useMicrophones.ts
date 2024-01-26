import useSWR from "swr"
import AgoraRTC from "agora-rtc-sdk-ng"
import { errorLogAndNotify } from "util/CommonUtil"
import { IAgoraRTCError } from "agora-rtc-react"

const fetcher = async () =>
   AgoraRTC.getDevices().then((devices) =>
      devices.filter((device) => device.kind === "audioinput")
   )

export const useMicrophones = () => {
   const res = useSWR<MediaDeviceInfo[], IAgoraRTCError>(
      "microphones",
      fetcher,
      {
         onError: errorLogAndNotify,
         fallbackData: [],
      }
   )

   return res
}
