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
         mediaStream.addTrack(localStreamData.stream.getAudioTrack());
         mediaStream.addTrack(localStreamData.stream.getVideoTrack());
         setLocalMediaStream(mediaStream);
      }
   }, [localStreamData, audioSource, videoSource]);

   const audioLevel = useSoundMeter(
      showSoundMeter,
      localMediaStream,
      soundMediaUpdateCounter
   );

   useEffect(() => {
      if (devices && localStreamData) {
         if (
            devices.audioInputList &&
            devices.audioInputList.length > 0 &&
            (!audioSource ||
               !devices.audioInputList.some(
                  (device) => device.value === audioSource
               )) &&
            devices.videoDeviceList &&
            devices.videoDeviceList.length > 0 &&
            (!videoSource ||
               !devices.videoDeviceList.some(
                  (device) => device.value === videoSource
               ))
         ) {
            initalizeAudioAndVideoSources(
               devices.audioInputList[0].value,
               devices.videoDeviceList[0].value
            );
         }
         if (
            devices.audioOutputList &&
            devices.audioOutputList.length > 0 &&
            (!speakerSource ||
               !devices.audioOutputList.some(
                  (device) => device.value === speakerSource
               ))
         ) {
            updateSpeakerSource(devices.audioOutputList[0].value);
         }
      }
   }, [devices, localStreamData]);

   const initalizeAudioAndVideoSources = (audioDeviceId, videoDeviceId) => {
      localStreamData.stream.switchDevice("audio", audioDeviceId, () => {
         setAudioSource(audioDeviceId);
         localStreamData.stream.switchDevice("video", videoDeviceId, () => {
            setVideoSource(videoDeviceId);
         });
      });
   };

   const updateAudioSource = useCallback(
      (deviceId) => {
         localStreamData.stream.switchDevice("audio", deviceId, () => {
            setAudioSource(deviceId);
         });
      },
      [localStreamData]
   );

   const updateVideoSource = useCallback(
      (deviceId) => {
         localStreamData.stream.switchDevice("video", deviceId, () => {
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
