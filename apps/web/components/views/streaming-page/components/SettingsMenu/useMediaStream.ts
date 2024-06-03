import { useEffect, useRef, useState } from "react"
import { useVirtualBackgroundMode } from "store/selectors/streamingAppSelectors"
import { useLocalTracks } from "../../context"

/**
 * This hook gets the video track from our local camera track and adds it to a new MediaStream.
 * This hook will remove all other tracks before adding the new track.
 */
export const useMediaStream = () => {
   const { localCameraTrack, cameraOn } = useLocalTracks()
   const virtualBackgroundMode = useVirtualBackgroundMode()

   const [localMediaStream, setLocalMediaStream] = useState<MediaStream>(null)

   const localCameraTrackRef = useRef(localCameraTrack)
   const videoElement = useRef<HTMLVideoElement | null>(null)

   const trackId = localCameraTrack.localCameraTrack?.getMediaStreamTrack().id
   const trackReadyState =
      localCameraTrack.localCameraTrack?.getMediaStreamTrack().readyState

   useEffect(() => {
      localCameraTrackRef.current = localCameraTrack
   }, [localCameraTrack])

   /**
    * Clones your current camera track and adds it to a new MediaStream.
    * The happens when:
    * 1. The camera is on
    * 2. The camera is on and the track is live
    * 3. The virtual background mode changes
    */
   useEffect(() => {
      if (!cameraOn) return

      setTimeout(() => {
         if (localCameraTrackRef.current.localCameraTrack) {
            let newMediaStream: MediaStream
            if (!localMediaStream) {
               newMediaStream = new MediaStream()
            } else {
               newMediaStream = localMediaStream.clone()
            }
            const liveVideoStreamTrack =
               localCameraTrackRef.current.localCameraTrack?.getMediaStreamTrack()
            if (liveVideoStreamTrack?.readyState === "live") {
               addTrackToMediaStream(newMediaStream, liveVideoStreamTrack)
            }
            setLocalMediaStream(newMediaStream)
         }
      }, 1500)
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [
      trackReadyState,
      trackId,
      localCameraTrack.localCameraTrack,
      virtualBackgroundMode,
      cameraOn,
   ])

   /**
    * Injects the local media stream into a video element.
    */
   useEffect(() => {
      if (
         cameraOn &&
         localMediaStream &&
         localMediaStream.getVideoTracks().length &&
         videoElement.current
      ) {
         videoElement.current.srcObject = localMediaStream
      }
   }, [localMediaStream, cameraOn])

   return videoElement
}

const addTrackToMediaStream = (
   mediaStream: MediaStream,
   trackToAdd: MediaStreamTrack
) => {
   const videoTracks = mediaStream.getVideoTracks()
   videoTracks.forEach(
      (track) => track.id !== trackToAdd.id && mediaStream.removeTrack(track)
   )
   const isAlreadyInTracks = videoTracks.find(
      (track) => track.id === trackToAdd.id
   )
   if (!isAlreadyInTracks) {
      mediaStream.addTrack(trackToAdd)
   }
}
