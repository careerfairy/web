import { useEffect, useState } from "react";
import { navigator } from "global";

export default function useDevices(localStream) {
   const [deviceList, setDeviceList] = useState({
      audioInputList: [],
      audioOutputList: [],
      videoDeviceList: [],
   });

   useEffect(() => {
      if (navigator && Boolean(localStream)) {
         navigator.mediaDevices
            .enumerateDevices()
            .then(gotDevices)
            .catch(handleError);
         navigator.mediaDevices.ondevicechange = () => {
            navigator.mediaDevices
               .enumerateDevices()
               .then(gotDevices)
               .catch(handleError);
         };
      }
   }, [Boolean(localStream), localStream?.audioTrack, localStream?.videoTrack]);

   function gotDevices(deviceInfos) {
      let audioInputList = [];
      let audioOutputList = [];
      let videoDeviceList = [];

      for (let i = 0; i !== deviceInfos.length; ++i) {
         const deviceInfo = deviceInfos[i];
         let option = {};
         option.value = deviceInfo.deviceId;
         if (
            deviceInfo.kind === "audioinput" &&
            deviceInfo.deviceId !== "default"
         ) {
            option.text =
               deviceInfo.label || `microphone ${audioInputList.length + 1}`;
            audioInputList.push(option);
         } else if (
            deviceInfo.kind === "audiooutput" &&
            deviceInfo.deviceId !== "default"
         ) {
            option.text =
               deviceInfo.label || `speaker ${audioOutputList.length + 1}`;
            audioOutputList.push(option);
         } else if (
            deviceInfo.kind === "videoinput" &&
            deviceInfo.deviceId !== "default"
         ) {
            option.text =
               deviceInfo.label || `camera ${videoDeviceList.length + 1}`;
            videoDeviceList.push(option);
         } else {
            console.log("Some other kind of source/device: ", deviceInfo);
         }
      }

      const newDevices = {
         audioInputList: audioInputList,
         audioOutputList: audioOutputList,
         videoDeviceList: videoDeviceList,
      };
      setDeviceList(newDevices);
   }

   function handleError(error) {
      console.log("error: ", error.message, error.name);
   }

   function isEmpty(devicesObject) {
      return !Object.keys(devicesObject).some((key) => {
         return devicesObject[key].length > 0;
      });
   }

   return deviceList;
}
