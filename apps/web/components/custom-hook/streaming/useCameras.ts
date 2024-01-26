import useSWR from "swr"
import AgoraRTC from "agora-rtc-sdk-ng"
import { IAgoraRTCError } from "agora-rtc-react"

const fetcher = async () =>
   AgoraRTC.getDevices().then((devices) =>
      devices.filter((device) => device.kind === "videoinput")
   )

export const useCameras = () => {
   const res = useSWR<MediaDeviceInfo[], IAgoraRTCError>("cameras", fetcher, {
      onError: console.error,
      fallbackData: [],
   })

   return res
}
