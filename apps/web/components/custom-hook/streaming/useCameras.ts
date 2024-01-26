import useSWR from "swr"
import AgoraRTC from "agora-rtc-sdk-ng"
import { IAgoraRTCError } from "agora-rtc-react"

const fetcher = async () =>
   AgoraRTC.getDevices().then((devices) =>
      devices.filter((device) => device.kind === "videoinput")
   )

export const useCameras = (shouldFetch: boolean) => {
   return useSWR<MediaDeviceInfo[], IAgoraRTCError>(
      shouldFetch ? "cameras" : null,
      fetcher,
      {
         onError: console.error,
         fallbackData: [],
      }
   )
}
