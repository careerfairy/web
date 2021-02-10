import {useState, useEffect} from 'react';
import {navigator} from 'global';
import {isEmptyArray} from 'formik';

export default function useDevices(refreshDevices) {

    const [deviceList, setDeviceList] = useState({audioInputList: [], audioOutputList: [], videoDeviceList: []});

    useEffect(() => {
        if (navigator && isEmpty(deviceList) && refreshDevices) {
            navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
            navigator.mediaDevices.ondevicechange = () => {
                navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
            }
        }
    },[refreshDevices]);

    function gotDevices(deviceInfos) {
        
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
        console.log('error: ', error.message, error.name);
    }

    function isEmpty(devicesObject) {
        return !Object.keys(devicesObject).some(key => {
            return devicesObject[key].length > 0;
        });
    }

    return deviceList;
}