import { useEffect, useMemo, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { getDeviceKindListName, getDeviceList } from "util/streamUtil";
import { DeviceList } from "types/streaming";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";

export default function useDevices(
   localStream,
   options?: { initialize: boolean }
) {
   const [devices, setDevices] = useState<DeviceList>({
      audioInputList: [],
      audioOutputList: [],
      videoDeviceList: [],
   });
   const dispatch = useDispatch();

   useEffect(() => {
      // (async function init() {
      //    if (!localStream || !options?.initialize) return;
      //    let cameraDevices;
      //    let microphoneDevices;
      //    try {
      //       cameraDevices = await AgoraRTC.getCameras();
      //    } catch (error) {
      //       dispatch(actions.handleSetDeviceError(error, "camera"));
      //    }
      //    try {
      //       microphoneDevices = await AgoraRTC.getMicrophones();
      //    } catch (error) {
      //       dispatch(actions.handleSetDeviceError(error, "microphone"));
      //    }
      //    if (microphoneDevices || cameraDevices) {
      //       const deviceArray = [];
      //       if (microphoneDevices) {
      //          deviceArray.push(...microphoneDevices);
      //       }
      //       if (cameraDevices) {
      //          deviceArray.push(...cameraDevices);
      //       }
      //       const newDeviceList = mapDevices(deviceArray);
      //       setDevices(newDeviceList);
      //    }
      // })();
   }, [Boolean(localStream), options?.initialize]);

   const initializeMicrophones = async () => {
      if (!localStream || !options?.initialize) return;
      let microphoneDevices;
      try {
         microphoneDevices = await AgoraRTC.getMicrophones();
      } catch (error) {
         dispatch(actions.handleSetDeviceError(error, "microphone"));
      }
      if (microphoneDevices) {
         const deviceArray = [];
         if (microphoneDevices) {
            deviceArray.push(...microphoneDevices);
         }
         setDevices((prevState) => ({
            ...prevState,
            audioInputList: getDeviceList(deviceArray, "audioinput"),
         }));
      }
   };
   const initializeCameras = async () => {
      if (!localStream || !options?.initialize) return;
      let cameraDevices;
      try {
         cameraDevices = await AgoraRTC.getCameras();
      } catch (error) {
         dispatch(actions.handleSetDeviceError(error, "camera"));
      }
      if (cameraDevices) {
         const deviceArray = [];
         if (cameraDevices) {
            deviceArray.push(...cameraDevices);
         }
         setDevices((prevState) => ({
            ...prevState,
            videoDeviceList: getDeviceList(deviceArray, "videoinput"),
         }));
      }
   };

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
      setDevices((prevDeviceList) => {
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

      setDevices((prevDeviceList) => {
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

   const deviceInitializers = useMemo(
      () => ({ initializeCameras, initializeMicrophones }),
      [localStream, options]
   );

   return { devices, deviceInitializers };
}
