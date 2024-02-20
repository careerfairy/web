import type { ILocalAudioTrack, IRemoteAudioTrack } from "agora-rtc-react"
import { useEffect, useState } from "react"

/**
 * A custom hook for monitoring an audio track's volume level.
 *
 * Sets an interval to periodically check and update the state with the audio track's volume level.
 * The check frequency can be modified with the `frequency` parameter. Without an audio track, the volume defaults to 0.
 *
 * @param {IRemoteAudioTrack | ILocalAudioTrack} audioTrack - Audio track to monitor.
 * @param {number} frequency - Check frequency in milliseconds, default is 1000ms.
 * @returns {number} Current volume level (0 - 1).
 *
 * @example
 * const volumeLevel = useVolumeLevel(audioTrack, 500);
 */
export const useAudioTrackVolumeLevel = (
   audioTrack?: IRemoteAudioTrack | ILocalAudioTrack,
   frequency: number = 1000
): number => {
   const [volumeLevel, setVolumeLevel] = useState(0)

   useEffect(() => {
      let intervalId: NodeJS.Timeout

      if (audioTrack) {
         intervalId = setInterval(() => {
            setVolumeLevel(audioTrack.getVolumeLevel() || 0)
         }, frequency)
      }

      return () => {
         clearInterval(intervalId)
      }
   }, [audioTrack, frequency])

   return volumeLevel
}
