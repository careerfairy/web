import { ILocalVideoTrack, IRemoteVideoTrack } from "agora-rtc-react"
import { useEffect, useState } from "react"

type VideoDimensions = {
   width: number
   height: number
}

const getTrackDimensions = (
   track: ILocalVideoTrack | IRemoteVideoTrack
): VideoDimensions | null => {
   if (!track || !track.isPlaying) return null

   const trackSettings = track.getMediaStreamTrack().getSettings()
   let { width, height } = trackSettings

   // Use fallback if width or height are not valid numbers
   if (typeof width !== "number" || typeof height !== "number") {
      const frameData = track.getCurrentFrameData() || {
         width: null,
         height: null,
      }

      width = typeof frameData.width === "number" ? frameData.width : null
      height = typeof frameData.height === "number" ? frameData.height : null
   }

   return width && height ? { width, height } : null
}

/**
 * Custom hook to get and update video track dimensions.
 *
 * This hook returns the current dimensions of the video track (width and height) and updates
 * these dimensions every second. If the track is not available, it returns null.
 *
 * @param {ILocalVideoTrack | IRemoteVideoTrack} track - The video track to get dimensions from.
 * @returns {VideoDimensions | null} The current dimensions of the video track or null if the track is not available.
 */
export const useVideoTrackDimensions = (
   track: ILocalVideoTrack | IRemoteVideoTrack
): VideoDimensions | null => {
   const [dimensions, setDimensions] = useState<VideoDimensions | null>(
      getTrackDimensions(track)
   )

   useEffect(() => {
      let interval: NodeJS.Timeout

      if (track) {
         interval = setInterval(() => {
            setDimensions(getTrackDimensions(track))
         }, 1000)
      }

      return () => {
         clearInterval(interval)
      }
   }, [track])

   return dimensions
}
