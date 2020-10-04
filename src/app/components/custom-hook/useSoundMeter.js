import { useState, useEffect } from "react";
import { navigator } from "global";

export function useSoundMeter(isShowAudioVideo, localStream, update) {

    const [audioValue, setAudioValue] = useState(0);
    const [soundMeter, setSoundMeter] = useState(null);

    useEffect(() => {
        if (navigator && localStream) {
            try {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                window.audioContext = new AudioContext();
            } catch (e) {
                console.log('Web Audio API not supported.');
            }
            if (soundMeter) {
                soundMeter.stop();
            }
            debugger;
            connectStream(localStream);
        }
    },[localStream, navigator, update]);

    useEffect(() => {
        if (!isShowAudioVideo && soundMeter) {
            soundMeter.stop();
        }
    },[isShowAudioVideo]);

    
    
    function SoundMeter(context) {
        this.context = context;
        this.instant = 0.0;
        this.slow = 0.0;
        this.clip = 0.0;
        this.script = context.createScriptProcessor(2048, 1, 1);
        const that = this;
        this.script.onaudioprocess = function(event) {
            const input = event.inputBuffer.getChannelData(0);
            let i;
            let sum = 0.0;
            let clipcount = 0;
            for (i = 0; i < input.length; ++i) {
                sum += input[i] * input[i];
                if (Math.abs(input[i]) > 0.99) {
                clipcount += 1;
                }
            }
            that.instant = Math.sqrt(sum / input.length);
            that.slow = 0.95 * that.slow + 0.05 * that.instant;
            that.clip = clipcount / input.length;
        };
      }
      
    SoundMeter.prototype.connectToSource = function(stream, callback) {
        console.log('SoundMeter connecting');
        try {
            this.mic = this.context.createMediaStreamSource(stream);
            this.mic.connect(this.script);
            // necessary to make sample run, but should not be.
            this.script.connect(this.context.destination);
            if (typeof callback !== 'undefined') {
            callback(null);
            }
        } catch (e) {
            console.error(e);
            if (typeof callback !== 'undefined') {
            callback(e);
            }
        }
    };
    
    SoundMeter.prototype.stop = function() {
        this.mic.disconnect();
        this.script.disconnect();
    };

    function connectStream(stream) {
        // Put variables in global scope to make them available to the
        // browser console.

        let zeroCounter = 0;
        const soundMeter = new SoundMeter(window.audioContext);
        soundMeter.connectToSource(stream, function(e) {
        if (e) {
            console.log(e);
            return;
        }
        setInterval(() => {
            if (soundMeter.instant.toFixed(2) == 0) {
                zeroCounter += 1;
                if (zeroCounter === 30) {
                    setAudioValue(0);    
                    zeroCounter = 0;
                }
            } else {
                setAudioValue(soundMeter.instant.toFixed(2));           
            }
        }, 200);
        });
        setSoundMeter(soundMeter);
    }

    return audioValue;
  }