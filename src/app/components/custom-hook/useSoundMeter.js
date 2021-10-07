import { useState, useEffect } from "react";
import { navigator } from "global";

export function useSoundMeter(showAudioMeter, audioTrack, update) {
   const [audioValue, setAudioValue] = useState(0);

   useEffect(() => {
      if (showAudioMeter) {
         if (navigator && audioTrack) {
            try {
               window.AudioContext =
                  window.AudioContext || window.webkitAudioContext;
               window.audioContext = new AudioContext();
            } catch (e) {
               console.log("Web Audio API not supported.");
            }
            onMicrophoneGranted(audioTrack);
         }
      } else {
         if (window.audioContext) {
            window.audioContext.suspend();
         }
      }
   }, [showAudioMeter, audioTrack, navigator, update]);

   async function onMicrophoneGranted(stream) {
      audioContext = new AudioContext();

      audioContext.audioWorklet
         .addModule("/volume-meter-processor.js")
         .then(() => {
            const mediaStream = new MediaStream();
            mediaStream.addTrack(stream);
            let microphone = audioContext.createMediaStreamSource(mediaStream);

            const node = new AudioWorkletNode(audioContext, "vumeter");

            node.port.onmessage = (event) => {
               let _volume = 0;
               let _sensibility = 5; // Just to add any sensibility to our ecuation
               if (event.data.volume) {
                  _volume = event.data.volume;
                  setAudioValue((_volume * 100) / _sensibility);
               }
            };

            microphone.connect(node).connect(audioContext.destination);
         })
         .catch((error) => {
            console.error(error);
         });
   }

   return audioValue;
}
