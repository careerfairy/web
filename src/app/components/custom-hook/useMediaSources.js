import {useState, useEffect} from 'react';
import {navigator} from 'global';
import {isEmptyArray} from 'formik';
import LocalStorageUtil from 'util/LocalStorageUtil';
import { useSoundMeter } from './useSoundMeter';

export default function useMediaSources(devices, webRTCAdaptor, streamId, localStream) {

    const [audioSource, setAudioSource] = useState(null);
    const [videoSource, setVideoSource] = useState(null);
    const [speakerSource, setSpeakerSource] = useState(null);
    const [soundMediaUpdateCounter, setSoundMeterUpdateCounter] = useState(0);

    const audioLevel = useSoundMeter(true, localStream, soundMediaUpdateCounter);

    useEffect(() => {
        const storedAudioSource = LocalStorageUtil.getAudioInputFromLocalStorage();
        const storedVideoSource = LocalStorageUtil.getVideoInputFromLocalStorage();
        const storedSpeakerSource = LocalStorageUtil.getAudioOutputFromLocalStorage();

        if (devices && webRTCAdaptor && localStream) {
            if (devices.audioInputList && devices.audioInputList.length > 0 && (!audioSource || !devices.audioInputList.some( device => device.value === audioSource))) {
                if (storedAudioSource && devices.audioInputList.some( device => device.value === storedAudioSource)) { 
                    updateAudioSource(storedAudioSource) 
                } else {
                    updateAudioSource(devices.audioInputList[0].value)
                }
            }
            if (devices.videoDeviceList && devices.videoDeviceList.length > 0 && !videoSource || !devices.videoDeviceList.some( device => device.value === videoSource)) {
                if (storedVideoSource && devices.videoDeviceList.some( device => device.value === storedVideoSource)) { 
                    updateVideoSource(storedVideoSource) 
                } else {
                    updateVideoSource(devices.videoDeviceList[0].value)
                }
            }
            if (devices.audioOutputList && devices.audioOutputList.length > 0 && !speakerSource || !devices.audioOutputList.some( device => device.value === speakerSource)) {
                if (storedSpeakerSource && devices.audioOutputList.some( device => device.value === storedSpeakerSource)) {
                    updateSpeakerSource(storedSpeakerSource) 
                } else {
                    updateSpeakerSource(devices.audioOutputList[0].value);
                }
            }
        }   
    },[devices, webRTCAdaptor, localStream]);

    function updateAudioSource(deviceId) {
        webRTCAdaptor.switchAudioInputSource(streamId, deviceId)
        setAudioSource(deviceId);
        LocalStorageUtil.setAudioInputFromLocalStorage(deviceId);
        setTimeout(() => {
            setSoundMeterUpdateCounter(soundMediaUpdateCounter + 1);
        }, 500);
    }

    function updateVideoSource(deviceId) {
        webRTCAdaptor.switchVideoCameraCapture(streamId, deviceId)
        setVideoSource(deviceId);
        LocalStorageUtil.setVideoInputFromLocalStorage(deviceId);
    }

    function updateSpeakerSource(deviceId) {
        setSpeakerSource(deviceId);
        LocalStorageUtil.setAudioOutputFromLocalStorage(deviceId);
    }

  
    return { audioSource, updateAudioSource, videoSource, updateVideoSource, speakerSource, updateSpeakerSource, audioLevel };
}