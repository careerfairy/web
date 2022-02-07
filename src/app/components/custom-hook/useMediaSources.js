import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";
import useLocalStorageMediaSources from "./useLocalStorageMediaSources";

export default function useMediaSources(devices, localStream, active) {
   const {
      storedAudioSourceId,
      storedVideoSourceId,
   } = useLocalStorageMediaSources();
   const dispatch = useDispatch();
   const [audioSource, setAudioSource] = useState(null);
   const [videoSource, setVideoSource] = useState(null);

   const [localMediaStream, setLocalMediaStream] = useState(null);

   useEffect(() => {
      if (active && localStream) {
         let mediaStream = undefined;
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

   const cleanupDisplayableMediaStream = (mediaStream) => {
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
         return updateVideoSource(newVideoSource);
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
         return updateAudioSource(newAudioSource);
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
               localStream.audioTrack.setDevice(deviceId).then(() => {
                  setAudioSource(deviceId);
               });
            } else {
               setAudioSource(deviceId);
            }
         } catch (e) {
            dispatch(actions.sendGeneralError(e));
         }
      },
      [localStream?.audioTrack]
   );

   const updateVideoSource = useCallback(
      async (deviceId) => {
         if (!localStream.videoTrack) return;
         try {
            const currentDeviceId = localStream.videoTrack
               .getMediaStreamTrack()
               .getSettings().deviceId;
            if (currentDeviceId !== deviceId) {
               await localStream.videoTrack.setDevice(deviceId);
               setVideoSource(deviceId);
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
      console.log("-> mediaControls");

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
