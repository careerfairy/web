import { useEffect, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import {
   DeviceOption,
   getDeviceKindListName,
   getDeviceList,
   mapDevices,
} from "util/streamUtil";
import { MediaDeviceInfo } from "agora-rtc-sdk";

export interface DeviceList {
   audioInputList: DeviceOption[];
   audioOutputList: DeviceOption[];
   videoDeviceList: DeviceOption[];
}

export default function useDevices(localStream) {
   const [deviceList, setDeviceList] = useState<DeviceList>({
      audioInputList: [],
      audioOutputList: [],
      videoDeviceList: [],
   });

   useEffect(() => {
      (async function init() {
         if (!localStream) return;
         const devices = await AgoraRTC.getDevices();
         const deviceList = mapDevices(devices);
         setDeviceList(deviceList);
      })();
   }, [Boolean(localStream)]);

   useEffect(() => {
      AgoraRTC.onMicrophoneChanged = (info) => {
         if (info.state === "ACTIVE") {
            handleAddMic(info.device);
         }
         if (info.state === "INACTIVE") {
            // Remove microphone from audioInputList list
            handleRemoveMic(info.device.deviceId);
         }
      };
      AgoraRTC.onCameraChanged = (info) => {
         if (info.state === "ACTIVE") {
            handleAddCamera(info.device);
         }
         if (info.state === "INACTIVE") {
            // Remove microphone from audioInputList list
            handleRemoveCamera(info.device.deviceId);
         }
      };
   }, []);

   const handleAddDevice = (
      device: MediaDeviceInfo,
      deviceType: MediaDeviceInfo["kind"]
   ) => {
      console.log(`-> ADDING ${deviceType}`);
      const listName = getDeviceKindListName(deviceType);
      setDeviceList((prevDeviceList) => {
         // Add microphone to audioInputList list
         return {
            ...prevDeviceList,
            [listName]: [
               ...prevDeviceList[listName],
               ...getDeviceList([device], deviceType),
            ],
         };
      });
   };

   const handleRemoveDevice = (
      deviceId: MediaDeviceInfo["deviceId"],
      deviceType: MediaDeviceInfo["kind"]
   ) => {
      console.log(`-> REMOVING ${deviceType}`);
      const listName = getDeviceKindListName(deviceType);

      setDeviceList((prevDeviceList) => {
         // Remove microphone from audioInputList list
         return {
            ...prevDeviceList,
            [listName]: prevDeviceList[listName].filter(
               (deviceOption) => deviceOption.value !== deviceId
            ),
         };
      });
   };

   const handleAddMic = (device: MediaDeviceInfo) => {
      handleAddDevice(device, "audioinput");
   };
   const handleAddCamera = (device: MediaDeviceInfo) => {
      handleAddDevice(device, "videoinput");
   };
   const handleRemoveMic = (deviceId: MediaDeviceInfo["deviceId"]) => {
      handleRemoveDevice(deviceId, "audioinput");
   };
   const handleRemoveCamera = (deviceId: MediaDeviceInfo["deviceId"]) => {
      handleRemoveDevice(deviceId, "videoinput");
   };

   return deviceList;
}
