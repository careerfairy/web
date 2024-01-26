import useSWR from "swr"
import { IAgoraRTCError, IAgoraRTC } from "agora-rtc-react"
import { isServer } from "components/helperFunctions/HelperFunctions"

const fetcher = async () => {
   if (isServer()) return []
   const AgoraRTCModule = (await import(
      "agora-rtc-sdk-ng"
   )) as unknown as IAgoraRTC
   return AgoraRTCModule.getDevices().then((devices) =>
      devices.filter((device) => device.kind === "videoinput")
   )
}

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
