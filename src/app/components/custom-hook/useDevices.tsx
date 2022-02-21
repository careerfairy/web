import { useEffect, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import {
   getDeviceKindListName,
   getDeviceList,
   mapDevices,
} from "util/streamUtil";
import { DeviceList } from "types/streaming";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";

export default function useDevices(
   localStream,
   options?: { initialize: boolean }
) {
   const [deviceList, setDeviceList] = useState<DeviceList>({
      audioInputList: [],
      audioOutputList: [],
      videoDeviceList: [],
   });
   const dispatch = useDispatch();

   useEffect(() => {
      (async function init() {
         if (!localStream || !options?.initialize) return;
         let cameraDevices;
         let microphoneDevices;
         try {
            cameraDevices = await AgoraRTC.getCameras();
         } catch (error) {
            dispatch(actions.handleSetDeviceError(error, "camera"));
         }
         try {
            microphoneDevices = await AgoraRTC.getMicrophones();
         } catch (error) {
            dispatch(actions.handleSetDeviceError(error, "microphone"));
         }
         if (microphoneDevices || cameraDevices) {
            const deviceArray = [];
            if (microphoneDevices) {
               deviceArray.push(...microphoneDevices);
            }
            if (cameraDevices) {
               deviceArray.push(...cameraDevices);
            }
            const newDeviceList = mapDevices(deviceArray);
            setDeviceList(newDeviceList);
         }
      })();
   }, [Boolean(localStream), options?.initialize]);

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
