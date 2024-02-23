import { ILocalVideoTrack, IRemoteVideoTrack } from "agora-rtc-react"
import { useEffect, useState } from "react"

type VideoDimensions = {
   width: number
   height: number
}

const getTrackDimensions = (
   track: ILocalVideoTrack | IRemoteVideoTrack
): VideoDimensions | null => {
   if (!track) return null

   const trackSettings = track.getMediaStreamTrack().getSettings()

   let { width, height } = trackSettings

   if (isNaN(width) || isNaN(height)) {
      // Fallback for browsers that don't support getSettings (e.g., Firefox)
      const trackFrame = track.getCurrentFrameData()
      width = trackFrame.width
      height = trackFrame.height
   }

   return { width: width || 0, height: height || 0 }
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
         setDimensions(null)
         clearInterval(interval)
      }
   }, [track])

   return dimensions
}
