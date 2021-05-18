import { useState, useEffect } from "react";
import { navigator } from "global";
import 'volumemeter'

export function useSoundMeter(showAudioMeter, audioTrack, update) {

    const [audioValue, setAudioValue] = useState(0);
    const [isFirstClick, setIsFirstClick] = useState(true)

    useEffect(() => {
        if (showAudioMeter) {
            if (navigator && audioTrack) {
                try {
                    window.AudioContext = window.AudioContext || window.webkitAudioContext;
                    window.audioContext = new AudioContext();
                } catch (e) {
                    console.log('Web Audio API not supported.');
                }
                onMicrophoneGranted(audioTrack);
            }
        } 
    },[showAudioMeter, audioTrack, navigator, update]);

    async function onMicrophoneGranted(stream) {
        // Instanciate just in the first time
        // when button is pressed
        if (isFirstClick) {
            debugger;
            setIsFirstClick(false)
            // Initialize AudioContext object(
            audioContext = new AudioContext()
    
            // Adding an AudioWorkletProcessor
            // from another script with addModule) method
            try {
                await audioContext.audioWorklet.addModule('scripts/volume-meter-processor.js')
            } catch(error) {
                debugger
                console.error(error)
            }
    
            // Creating a MediaStreamSource object
            // and sending a MediaStream object granted by 
            // the user
            let microphone = audioContext.createMediaStreamSource(stream)
    
            // Creating AudioWorkletNode sending
            // context and name of processor registered
            // in vumeter-processor.js
            const node = new AudioWorkletNode(audioContext, 'volumemeter')
    
            // Listing any message from AudioWorkletProcessor in its
            // process method here where you can know
            // the volume level
            node.port.onmessage  = event => {
                let _volume = 0
                let _sensibility = 5 // Just to add any sensibility to our ecuation
                if (event.data.volume) {
                    _volume = event.data.volume;
                    setAudioValue((_volume * 100) / _sensibility)
                }              
            }
    
            // Now this is the way to
            // connect our microphone to
            // the AudioWorkletNode and output from audioContext
            microphone.connect(node).connect(audioContext.destination)
    
        }
    
        // Just to know if button is on or off
        // and stop or resume the microphone listening
        // if (listening) {
        //     audioContext.suspend()
        // } else {
        //     audioContext.resume()
        // }
    
        // listening = !listening
    }

    return audioValue;
  }