import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"

import { IAgoraRTC, IAgoraRTCError } from "agora-rtc-react"
import { isServer } from "components/helperFunctions/HelperFunctions"

const fetcher = async () => {
   if (isServer()) return []
   const AgoraRTCModule = (await import(
      "agora-rtc-sdk-ng"
   )) as unknown as IAgoraRTC
   return AgoraRTCModule.getDevices().then((devices) =>
      devices.filter((device) => device.kind === "audioinput")
   )
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
