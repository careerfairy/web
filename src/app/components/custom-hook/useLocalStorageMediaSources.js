import React, { useCallback } from "react";
import { useLocalStorage } from "react-use";

const useLocalStorageMediaSources = () => {
   const [
      storedAudioSourceId,
      setAudioSourceId,
      removeAudioSourceId,
   ] = useLocalStorage("audioSourceId");
   const [
      storedVideoSourceId,
      setVideoSourceId,
      removeVideoSourceId,
   ] = useLocalStorage("videoSourceId");

   const storeNewMediaSources = useCallback(
      ({ audioSourceId, videoSourceId }) => {
         audioSourceId && setAudioSourceId(audioSourceId);
         videoSourceId && setVideoSourceId(videoSourceId);
      },
      []
   );

   const setStoredPreferredMediaControls = useCallback(
      (mediaControls, devices) => {
         if (
            !devices.audioInputList.length &&
            !devices.videoDeviceList.length
         ) {
            return;
         }
         const preferredAudioDeviceInDeviceList = devices.audioInputList?.find(
            (device) => device.value === storedAudioSourceId
         );
         const preferredVideoDeviceInDeviceList = devices.videoDeviceList?.find(
            (device) => device.value === storedVideoSourceId
         );
         if (preferredAudioDeviceInDeviceList?.value) {
            console.log(
               "-> updated Audio Device with",
               preferredAudioDeviceInDeviceList
            );
            mediaControls.updateAudioSource(
               preferredAudioDeviceInDeviceList.value
            );
         }
         if (preferredVideoDeviceInDeviceList?.value) {
            console.log(
               "-> updated Video Device with",
               preferredVideoDeviceInDeviceList
            );
            try {
               mediaControls.updateVideoSource(
                  preferredVideoDeviceInDeviceList.value
               );
            } catch (e) {
               console.error(e);
            }
         }
      },
      []
   );

   const clearStoredMediaSources = useCallback(() => {
      removeAudioSourceId();
      removeVideoSourceId();
   }, []);

   return {
      storeNewMediaSources,
      storedVideoSourceId,
      storedAudioSourceId,
      setVideoSourceId,
      setAudioSourceId,
      clearStoredMediaSources,
      setStoredPreferredMediaControls,
   };
};

export default useLocalStorageMediaSources;
