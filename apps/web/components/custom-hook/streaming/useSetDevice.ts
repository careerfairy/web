import { ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-react"
import { useEffect } from "react"
import { errorLogAndNotify } from "util/CommonUtil"

/**
 * Sets the active device for a track and handles errors.
 * @param track - The audio or video track.
 * @param activeDeviceId - The device ID to set.
 * @returns null
 */
export const useSetDevice = (
   track: IMicrophoneAudioTrack | ICameraVideoTrack,
   activeDeviceId: string
) => {
   useEffect(() => {
      if (track && activeDeviceId) {
         track.setDevice(activeDeviceId).catch((error) =>
            errorLogAndNotify(error, {
               message: "Failed to set the active microphone device",
               metadata: {
                  activeDeviceId,
               },
            })
         )
      }
   }, [activeDeviceId, track])

   return null
}
