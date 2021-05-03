import {useState, useEffect} from 'react';
import {navigator} from 'global';
import {isEmptyArray} from 'formik';
import LocalStorageUtil from 'util/LocalStorageUtil';
import { useSoundMeter } from './useSoundMeter';

export default function useMediaSources(devices, streamId, localStream, showSoundMeter) {

    const [audioSource, setAudioSource] = useState(null);
    const [videoSource, setVideoSource] = useState(null);
    const [speakerSource, setSpeakerSource] = useState(null);
    const [soundMediaUpdateCounter, setSoundMeterUpdateCounter] = useState(0);

    const [localMediaStream, setLocalMediaStream] = useState(null);

    useEffect(() => {
        if (localStream) {
            const mediaStream = new MediaStream();
            mediaStream.addTrack(localStream.audioTrack.getMediaStreamTrack());
            mediaStream.addTrack(localStream.videoTrack.getMediaStreamTrack());
            setLocalMediaStream(mediaStream);
        }
    }, [localStream, audioSource, videoSource])

    const audioLevel = useSoundMeter(showSoundMeter, localMediaStream, soundMediaUpdateCounter);

    useEffect(() => {
        if (devices && localStream) {
            if (devices.audioInputList && devices.audioInputList.length > 0 && (!audioSource || !devices.audioInputList.some( device => device.value === audioSource))
                && devices.videoDeviceList && devices.videoDeviceList.length > 0 && (!videoSource || !devices.videoDeviceList.some( device => device.value === videoSource))) {
                initalizeAudioAndVideoSources(devices.audioInputList[0].value, devices.videoDeviceList[0].value)
            }
            if (devices.audioOutputList && devices.audioOutputList.length > 0 && (!speakerSource || !devices.audioOutputList.some( device => device.value === speakerSource))) {
                updateSpeakerSource(devices.audioOutputList[0].value);
            }
        }   
    },[devices, localStream]);

    const initalizeAudioAndVideoSources = (audioDeviceId, videoDeviceId) => {
        localStream.audioTrack.setDevice(audioDeviceId).then(() => {
            setAudioSource(audioDeviceId);
            localStream.videoTrack.setDevice(videoDeviceId).then(() => {
                setVideoSource(videoDeviceId);
            })
        })
    }

    function updateAudioSource(deviceId) {
        localStream.audioTrack.setDevice(deviceId).then(() => {
            setAudioSource(deviceId);
        })
    }

    function updateVideoSource(deviceId) {
        localStream.videoTrack.setDevice(deviceId).then(() => {
            setVideoSource(deviceId);
        })
    }

    function updateSpeakerSource(deviceId) {
        setSpeakerSource(deviceId);
    }

  
    return { audioSource, updateAudioSource, videoSource, updateVideoSource, speakerSource, updateSpeakerSource, localMediaStream, audioLevel };
}