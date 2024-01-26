import useSWR from "swr"
import AgoraRTC from "agora-rtc-sdk-ng"
import { errorLogAndNotify } from "util/CommonUtil"
import { IAgoraRTCError } from "agora-rtc-react"

const fetcher = async () =>
   AgoraRTC.getDevices().then((devices) =>
      devices.filter((device) => device.kind === "audioinput")
   )

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
