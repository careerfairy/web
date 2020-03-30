import { useState, useEffect } from 'react';
import { navigator } from 'global';

export default function useUserMedia() {

    const [deviceList, setDeviceList] = useState({ audioInputList: [], audioOutputList: [], videoDeviceList: [] });

    function gotDevices(deviceInfos) {
        debugger;
        // Handles being called several times to update labels. Preserve values.
        let audioInputList = [];
        let audioOutputList = [];
        let videoDeviceList = [];

        for (let i = 0; i !== deviceInfos.length; ++i) {
            const deviceInfo = deviceInfos[i];
            let option = {};
            option.value = deviceInfo.deviceId;
            if (deviceInfo.kind === 'audioinput' && deviceInfo.deviceId !== "default") {
                option.text = deviceInfo.label || `microphone ${audioInputList.length + 1}`;
                audioInputList.push(option);
            } else if (deviceInfo.kind === 'audiooutput' && deviceInfo.deviceId !== "default") {
                option.text = deviceInfo.label || `speaker ${audioOutputList.length + 1}`;
                audioOutputList.push(option);
            } else if (deviceInfo.kind === 'videoinput' && deviceInfo.deviceId !== "default") {
                option.text = deviceInfo.label || `camera ${videoDeviceList.length + 1}`;
                videoDeviceList.push(option);
            } else {
                console.log('Some other kind of source/device: ', deviceInfo);
            }
        }
        setDeviceList({
            "audioInputList": audioInputList,
            "audioOutputList": audioOutputList,
            "videoDeviceList": videoDeviceList
        });
    }

    function handleError(error) {
        console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
      }

    if (navigator) {
        navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
    }
  
    return deviceList;
}