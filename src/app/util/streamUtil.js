export const mapDevices = (deviceInfos) => {
   let audioInputList = [];
   let audioOutputList = [];
   let videoDeviceList = [];
   deviceInfos.forEach((deviceInfo) => {
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
   });

   return {
      audioInputList: audioInputList,
      audioOutputList: audioOutputList,
      videoDeviceList: videoDeviceList,
   };
};
