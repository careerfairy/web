import { useState, useEffect } from 'react';
import { navigator } from 'global';

export function useLocalStream(mediaConstraints) {

    const [localStream, setLocalStream] = useState(null);

    useEffect(() => {
        if (mediaConstraints) {
            if (window.stream) {
                window.stream.getTracks().forEach(track => {
                  track.stop();
                });
              }
            navigator.mediaDevices.getUserMedia(mediaConstraints).then( stream => {
                window.stream = stream;
                setLocalStream(stream);
            }).catch(error => {
                console.log(error);
            });
        }
    },[mediaConstraints]);
  
    return localStream;
}