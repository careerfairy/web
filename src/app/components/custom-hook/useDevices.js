import { useEffect, useState } from "react";
// import { navigator } from "global";
import AgoraRTC from "agora-rtc-sdk-ng";
import { mapDevices } from "util/streamUtil";

export default function useDevices(localStream) {
   const [deviceList, setDeviceList] = useState({
      audioInputList: [],
      audioOutputList: [],
      videoDeviceList: [],
   });

   useEffect(() => {
      (async function init() {
         const devices = await AgoraRTC.getDevices();
         const deviceList = mapDevices(devices);
         AgoraRTC.onMicrophoneChanged = (info) => {
            setDeviceList((prevDeviceList) => {
               const deviceId = info.device.deviceId;
               if (info.state === "ACTIVE") {
                  // Add microphone to audioInputList list
               }
               if (info.state === "INACTIVE") {
                  // Remove microphone from audioInputList list
               }
               return prevDeviceList;
            });
            console.log("microphone changed!", info.state, info.device);
         };
         setDeviceList(deviceList);
      })();
   }, []);

   // useEffect(() => {
   //    if (navigator && Boolean(localStream)) {
   //       navigator.mediaDevices
   //          .enumerateDevices()
   //          .then(gotDevices)
   //          .catch(handleError);
   //       navigator.mediaDevices.ondevicechange = () => {
   //          navigator.mediaDevices
   //             .enumerateDevices()
   //             .then(gotDevices)
   //             .catch(handleError);
   //       };
   //    }
   // }, [Boolean(localStream), localStream?.audioTrack, localStream?.videoTrack]);

   function handleError(error) {
      console.log("error: ", error.message, error.name);
   }

   return deviceList;
}
