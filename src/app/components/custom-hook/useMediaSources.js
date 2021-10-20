import { useCallback, useEffect, useState } from "react";
import { useSoundMeter } from "./useSoundMeter";

export default function useMediaSources(
   devices,
   localStream,
   showSoundMeter,
   active
) {
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
   }, [localStream, localStream?.audioTrack, localStream?.videoTrack, active]);

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

   const audioLevel = useSoundMeter(
      showSoundMeter,
      localStream?.audioTrack?.getMediaStreamTrack()
   );

   useEffect(() => {
      if (active && devices && localStream) {
         if (devices.audioInputList && devices.audioInputList.length > 0) {
            if (localStream.audioTrack) {
               updateAudioSource(devices.audioInputList[0].value);
            }
         }
         if (devices.videoDeviceList && devices.videoDeviceList.length > 0) {
            if (localStream.videoTrack) {
               updateVideoSource(devices.videoDeviceList[0].value);
            }
         }
      }
   }, [devices, localStream?.uid, active]);

   useEffect(() => {
      if (!localStream.audioTrack) {
         setAudioSource(null);
      }
      if (!localStream.videoTrack) {
         setVideoSource(null);
      }
   }, [localStream?.audioTrack, localStream?.videoTrack]);

   const updateAudioSource = useCallback(
      (deviceId) => {
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
      },
      [localStream?.audioTrack]
   );

   const updateVideoSource = useCallback(
      (deviceId) => {
         const currentDeviceId = localStream.videoTrack
            .getMediaStreamTrack()
            .getSettings().deviceId;
         if (currentDeviceId !== deviceId) {
            localStream.videoTrack.setDevice(deviceId).then(() => {
               setVideoSource(deviceId);
            });
         } else {
            setVideoSource(deviceId);
         }
      },
      [localStream?.videoTrack]
   );

   return {
      mediaControls: {
         audioSource,
         updateAudioSource,
         videoSource,
         updateVideoSource,
         audioLevel,
      },
      localMediaStream,
   };
}
