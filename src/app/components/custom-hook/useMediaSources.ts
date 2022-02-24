import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";
import useLocalStorageMediaSources from "./useLocalStorageMediaSources";
import { DeviceList, LocalStream } from "types/streaming";

export default function useMediaSources(
   devices: DeviceList,
   localStream: LocalStream,
   active: boolean
) {
   const { storedAudioSourceId, storedVideoSourceId } =
      useLocalStorageMediaSources();
   const dispatch = useDispatch();
   const [audioSource, setAudioSource] = useState(null);
   const [videoSource, setVideoSource] = useState(null);

   const [localMediaStream, setLocalMediaStream] = useState(null);

   useEffect(() => {
      if (active && localStream) {
         let mediaStream: MediaStream;
         if (!localMediaStream) {
            mediaStream = new MediaStream();
         } else {
            mediaStream = localMediaStream;
            cleanupDisplayableMediaStream(mediaStream);
         }
         if (localStream.audioTrack) {
            mediaStream.addTrack(localStream.audioTrack.getMediaStreamTrack());
         }
         if (localStream.videoTrack) {
            mediaStream.addTrack(localStream.videoTrack.getMediaStreamTrack());
         }
         setLocalMediaStream(mediaStream);
      }
   }, [
      localStream,
      localStream?.audioTrack,
      localStream?.videoTrack,
      localStream?.videoTrack?.getMediaStreamTrack().getSettings().deviceId,
      active,
   ]);

   const cleanupDisplayableMediaStream = (mediaStream: MediaStream) => {
      const audioTracks = mediaStream.getAudioTracks();
      const videoTracks = mediaStream.getVideoTracks();
      if (audioTracks.length > 0) {
         mediaStream.removeTrack(audioTracks[0]);
      }
      if (videoTracks.length > 0) {
         mediaStream.removeTrack(videoTracks[0]);
      }
   };

   useEffect(() => {
      if (
         active &&
         devices.videoDeviceList?.length &&
         localStream?.videoTrack
      ) {
         const newVideoSource =
            devices.videoDeviceList.find(
               (device) => device.value === storedVideoSourceId
            )?.value || devices.videoDeviceList[0].value;
         void updateVideoSource(newVideoSource);
      }
   }, [
      devices,
      localStream?.uid,
      active,
      localStream.videoTrack,
      storedVideoSourceId,
   ]);

   useEffect(() => {
      if (active && devices.audioInputList?.length && localStream?.audioTrack) {
         const newAudioSource =
            devices.audioInputList.find(
               (device) => device.value === storedAudioSourceId
            )?.value || devices.audioInputList[0].value;
         void updateAudioSource(newAudioSource);
      }
   }, [
      devices,
      localStream?.uid,
      active,
      localStream.audioTrack,
      storedAudioSourceId,
   ]);

   useEffect(() => {
      if (localStream) {
         if (!localStream.audioTrack) {
            setAudioSource(null);
         }
         if (!localStream.videoTrack) {
            setVideoSource(null);
         }
      }
   }, [localStream?.audioTrack, localStream?.videoTrack]);

   const updateAudioSource = useCallback(
      async (deviceId) => {
         if (!localStream.audioTrack) return;
         try {
            const currentDeviceId = localStream.audioTrack
               .getMediaStreamTrack()
               .getSettings().deviceId;
            if (currentDeviceId !== deviceId) {
               try {
                  await localStream.audioTrack.setDevice(deviceId);
                  setAudioSource(deviceId);
                  handleSetMicIsNotInUse();
               } catch (error) {
                  handleSetMicInUse(error);
               }
            } else {
               setAudioSource(deviceId);
            }
         } catch (e) {
            dispatch(actions.sendGeneralError(e));
         }
      },
      [localStream?.audioTrack]
   );

   const handleSetMicIsNotInUse = () =>
      dispatch(actions.handleClearDeviceError("microphoneIsUsedByOtherApp"));
   const handleSetMicInUse = (error) =>
      dispatch(actions.handleSetDeviceError(error, "microphone"));

   const handleSetCamIsInUse = (error) =>
      dispatch(actions.handleSetDeviceError(error, "camera"));
   const handleSetCamIsNotInUse = () =>
      dispatch(actions.handleClearDeviceError("microphoneIsUsedByOtherApp"));
   const updateVideoSource = useCallback(
      async (deviceId: MediaDeviceInfo["deviceId"]) => {
         if (!localStream.videoTrack) return;
         try {
            const currentDeviceId = localStream.videoTrack
               .getMediaStreamTrack()
               .getSettings().deviceId;
            if (currentDeviceId !== deviceId) {
               try {
                  await localStream.videoTrack.setDevice(deviceId);
                  handleSetCamIsNotInUse();
                  setVideoSource(deviceId);
               } catch (e) {
                  handleSetCamIsInUse(e);
                  console.log("-> error in setDevice", e);
               }
            } else {
               setVideoSource(deviceId);
            }
         } catch (e) {
            dispatch(actions.sendGeneralError(e));
         }
      },
      [localStream?.videoTrack]
   );

   const mediaControls = useMemo(() => {
      return {
         audioSource,
         updateAudioSource,
         videoSource,
         updateVideoSource,
      };
   }, [audioSource, updateAudioSource, videoSource, updateVideoSource]);
   return {
      mediaControls,
      localMediaStream,
   };
}
