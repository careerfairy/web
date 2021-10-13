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
   const [soundMediaUpdateCounter, setSoundMeterUpdateCounter] = useState(0);

   const [localMediaStream, setLocalMediaStream] = useState(null);

   useEffect(() => {
      if (active && localStream) {
         const mediaStream = new MediaStream();
         mediaStream.addTrack(localStream.audioTrack.getMediaStreamTrack());
         mediaStream.addTrack(localStream.videoTrack.getMediaStreamTrack());
         setLocalMediaStream(mediaStream);
      }
   }, [localStream, audioSource, videoSource, active]);

   const audioLevel = useSoundMeter(
      showSoundMeter,
      localStream?.audioTrack?.getMediaStreamTrack(),
      soundMediaUpdateCounter
   );

   useEffect(() => {
      if (active && devices && localStream) {
         if (
            devices.audioInputList &&
            devices.audioInputList.length > 0 &&
            devices.videoDeviceList &&
            devices.videoDeviceList.length > 0
         ) {
            initalizeAudioAndVideoSources(
               devices.audioInputList[0].value,
               devices.videoDeviceList[0].value
            );
         }
      }
   }, [devices, localStream?.uid, active]);

   const initalizeAudioAndVideoSources = (audioDeviceId, videoDeviceId) => {
      localStream.audioTrack.setDevice(audioDeviceId).then(() => {
         setAudioSource(audioDeviceId);
         localStream.videoTrack.setDevice(videoDeviceId).then(() => {
            setVideoSource(videoDeviceId);
         });
      });
   };

   const updateAudioSource = useCallback(
      (deviceId) => {
         localStream.audioTrack.setDevice(deviceId).then(() => {
            setAudioSource(deviceId);
         });
      },
      [localStream]
   );

   const updateVideoSource = useCallback(
      (deviceId) => {
         localStream.videoTrack.setDevice(deviceId).then(() => {
            setVideoSource(deviceId);
         });
      },
      [localStream]
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
