import { DeviceOption } from "../types/streaming";
import { mainProductionDomain, nextGenSubDomain } from "../constants/domains";

const getDeviceKindLabel = (deviceKind: MediaDeviceInfo["kind"]) => {
   if (deviceKind === "audioinput") return "microphone";
   if (deviceKind === "audiooutput") return "speaker";
   if (deviceKind === "videoinput") return "camera";
   return "unknown";
};
export const getDeviceKindListName = (deviceKind: MediaDeviceInfo["kind"]) => {
   if (deviceKind === "audioinput") return "audioInputList";
   if (deviceKind === "audiooutput") return "audioOutputList";
   if (deviceKind === "videoinput") return "videoDeviceList";
   return "unknownDeviceList";
};

export const getDeviceList = (
   deviceInfos: MediaDeviceInfo[],
   deviceKind: MediaDeviceInfo["kind"]
) => {
   return deviceInfos.reduce((acc, currDeviceInfo) => {
      if (
         currDeviceInfo.kind === deviceKind &&
         currDeviceInfo.deviceId !== "default"
      ) {
         const option = {
            value: currDeviceInfo.deviceId,
            text:
               currDeviceInfo.label ||
               `${getDeviceKindLabel(currDeviceInfo.kind)} ${
                  deviceInfos.length + 1
               }`,
         } as DeviceOption;
         return acc.concat(option);
      } else {
         return acc;
      }
   }, []) as DeviceOption[];
};
export const mapDevices = (deviceInfos: MediaDeviceInfo[]) => {
   let audioInputList = getDeviceList(deviceInfos, "audioinput");
   let audioOutputList = getDeviceList(deviceInfos, "audiooutput");
   let videoDeviceList = getDeviceList(deviceInfos, "videoinput");

   return {
      audioInputList: audioInputList,
      audioOutputList: audioOutputList,
      videoDeviceList: videoDeviceList,
   };
};

export const shouldWeRedirectNextGen = (
   currentHost: string,
   currentEnv: string,
   livestreamIsBeta: boolean,
   requestDetails: string
) => {
   const isInProdEnvironment = currentEnv === "production";

   const isInNextGenSubDomain = currentHost === nextGenSubDomain;
   const isBeta = livestreamIsBeta;
   // if we should redirect, we return a string with the URL to redirect

   if (!isInProdEnvironment || typeof isBeta !== "boolean") {
      return null;
   }
   if (isBeta) {
      if (!isInNextGenSubDomain) {
         return `https://${nextGenSubDomain}${requestDetails}`;
      }
   } else {
      if (isInNextGenSubDomain) {
         return `https://${mainProductionDomain}${requestDetails}`;
      }
   }

   // we don't need to redirect
   return null;
};
