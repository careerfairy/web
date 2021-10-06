import { useCallback, useEffect, useState } from "react";
import { useSoundMeter } from "./useSoundMeter";

export default function useMediaSources(
   devices,
   streamId,
   localStreamData,
   showSoundMeter
) {
   const [audioSource, setAudioSource] = useState(null);
   const [videoSource, setVideoSource] = useState(null);
   const [speakerSource, setSpeakerSource] = useState(null);
   const [soundMediaUpdateCounter, setSoundMeterUpdateCounter] = useState(0);

   const [localMediaStream, setLocalMediaStream] = useState(null);

   useEffect(() => {
      if (localStreamData) {
         const mediaStream = new MediaStream();
         mediaStream.addTrack(localStream.audioTrack.getMediaStreamTrack());
         mediaStream.addTrack(localStream.videoTrack.getMediaStreamTrack());
         setLocalMediaStream(mediaStream);
      }
   }, [localStreamData, audioSource, videoSource]);

   const audioLevel = useSoundMeter(
      showSoundMeter,
      localStream?.audioTrack?.getMediaStreamTrack(),
      soundMediaUpdateCounter
   );

   useEffect(() => {
      if (devices && localStreamData) {
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
         if (devices.audioOutputList && devices.audioOutputList.length > 0) {
            updateSpeakerSource(devices.audioOutputList[0].value);
         }
      }
   }, [devices, localStreamData]);

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
      [localStreamData]
   );

   const updateVideoSource = useCallback(
      (deviceId) => {
         localStream.videoTrack.setDevice(deviceId).then(() => {
            setVideoSource(deviceId);
         });
      },
      [localStreamData]
   );

   const updateSpeakerSource = useCallback((deviceId) => {
      setSpeakerSource(deviceId);
   }, []);

   return {
      audioSource,
      updateAudioSource,
      videoSource,
      updateVideoSource,
      speakerSource,
      updateSpeakerSource,
      localMediaStream,
      audioLevel,
   };
}
