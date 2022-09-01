import { useCallback, useEffect, useMemo, useState } from "react"
import { useDispatch } from "react-redux"
import * as actions from "store/actions"
import useLocalStorageMediaSources from "./useLocalStorageMediaSources"
import { DeviceList, LocalStream } from "types/streaming"

export default function useMediaSources(
   devices: DeviceList,
   localStream: LocalStream,
   active: boolean
) {
   const { storedAudioSourceId, storedVideoSourceId } =
      useLocalStorageMediaSources()
   const dispatch = useDispatch()
   const [audioSource, setAudioSource] = useState(null)
   const [videoSource, setVideoSource] = useState(null)

   const [localMediaStream, setLocalMediaStream] = useState<MediaStream>(null)

   useEffect(() => {
      if (localStream) {
         let newMediaStream: MediaStream
         if (!localMediaStream) {
            newMediaStream = new MediaStream()
         } else {
            newMediaStream = localMediaStream.clone()
         }
         const liveAudioStreamTrack =
            localStream?.audioTrack?.getMediaStreamTrack()
         if (liveAudioStreamTrack?.readyState === "live") {
            addTrackToMediaStream(newMediaStream, liveAudioStreamTrack, "audio")
         }
         const liveVideoStreamTrack =
            localStream?.videoTrack?.getMediaStreamTrack()
         if (liveVideoStreamTrack?.readyState === "live") {
            addTrackToMediaStream(newMediaStream, liveVideoStreamTrack, "video")
         }
         setLocalMediaStream(newMediaStream)
      }
   }, [
      localStream?.audioTrack,
      localStream?.videoTrack?.getMediaStreamTrack().readyState,
      localStream?.videoTrack?.getMediaStreamTrack().id,
   ])

   const addTrackToMediaStream = (
      mediaStream: MediaStream,
      trackToAdd: MediaStreamTrack,
      trackType: "audio" | "video"
   ) => {
      const audioTracks = mediaStream.getAudioTracks()
      const videoTracks = mediaStream.getVideoTracks()
      if (trackType === "video") {
         handleAddAndRemove(videoTracks, mediaStream, trackToAdd)
      }
      if (trackType === "audio") {
         handleAddAndRemove(audioTracks, mediaStream, trackToAdd)
      }
   }

   const handleAddAndRemove = (
      currentTrackList: MediaStreamTrack[],
      mediaStream: MediaStream,
      trackToAdd: MediaStreamTrack
   ) => {
      currentTrackList.forEach(
         (track) => track.id !== trackToAdd.id && mediaStream.removeTrack(track)
      )
      const isAlreadyInTracks = currentTrackList.find(
         (track) => track.id === trackToAdd.id
      )
      if (!isAlreadyInTracks) {
         mediaStream.addTrack(trackToAdd)
      }
   }

   useEffect(() => {
      if (
         active &&
         devices.videoDeviceList?.length &&
         localStream?.videoTrack
      ) {
         const newVideoSource =
            devices.videoDeviceList.find(
               (device) => device.value === storedVideoSourceId
            )?.value || devices.videoDeviceList[0].value
         void updateVideoSource(newVideoSource)
      }
   }, [
      devices,
      localStream?.uid,
      active,
      localStream.videoTrack,
      storedVideoSourceId,
   ])

   useEffect(() => {
      if (active && devices.audioInputList?.length && localStream?.audioTrack) {
         const newAudioSource =
            devices.audioInputList.find(
               (device) => device.value === storedAudioSourceId
            )?.value || devices.audioInputList[0].value
         void updateAudioSource(newAudioSource)
      }
   }, [
      devices,
      localStream?.uid,
      active,
      localStream.audioTrack,
      storedAudioSourceId,
   ])

   useEffect(() => {
      if (localStream) {
         if (!localStream.audioTrack) {
            setAudioSource(null)
         }
         if (!localStream.videoTrack) {
            setVideoSource(null)
         }
      }
   }, [localStream?.audioTrack, localStream?.videoTrack])

   const updateAudioSource = useCallback(
      async (deviceId) => {
         if (!localStream.audioTrack) return
         try {
            try {
               await localStream.audioTrack.setDevice(deviceId)
               setAudioSource(deviceId)
               handleSetMicIsNotInUse()
            } catch (error) {
               handleSetMicInUse(error)
            }
         } catch (e) {
            dispatch(actions.sendGeneralError(e))
         }
      },
      [localStream?.audioTrack]
   )

   const handleSetMicIsNotInUse = () =>
      dispatch(actions.handleClearDeviceError("microphoneIsUsedByOtherApp"))
   const handleSetMicInUse = (error) =>
      dispatch(actions.handleSetDeviceError(error, "microphone"))

   const handleSetCamIsInUse = (error) =>
      dispatch(actions.handleSetDeviceError(error, "camera"))
   const handleSetCamIsNotInUse = () =>
      dispatch(actions.handleClearDeviceError("cameraIsUsedByOtherApp"))
   const updateVideoSource = useCallback(
      async (deviceId: MediaDeviceInfo["deviceId"]) => {
         if (!localStream.videoTrack) return
         console.log("-> UPDATING VIDEO SOURCE")
         try {
            try {
               await localStream.videoTrack.setDevice(deviceId)
               handleSetCamIsNotInUse()
               setVideoSource(deviceId)
            } catch (e) {
               handleSetCamIsInUse(e)
               console.log("-> error in setDevice", e)
            }
         } catch (e) {
            dispatch(actions.sendGeneralError(e))
         }
      },
      [localStream?.videoTrack]
   )

   return useMemo(
      () => ({
         mediaControls: {
            audioSource,
            updateAudioSource,
            videoSource,
            updateVideoSource,
         },
         localMediaStream,
      }),
      [
         audioSource,
         updateAudioSource,
         videoSource,
         updateVideoSource,
         localMediaStream,
      ]
   )
}
