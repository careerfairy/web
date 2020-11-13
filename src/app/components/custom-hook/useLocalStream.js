import { useState, useEffect } from 'react';
import { navigator } from 'global';

export function useLocalStream(mediaConstraints) {

    const [permissionGranted, setPermissionGranted] = useState(false);
    const [userMediaError, setUserMediaError] = useState(null);
    const [localStream, setLocalStream] = useState(null);

    useEffect(() => {
        if (mediaConstraints) {
            if (window.stream) {
                window.stream.getTracks().forEach(track => {
                  track.stop();
                });
              }
            navigator.mediaDevices.getUserMedia(mediaConstraints).then( stream => {
                setPermissionGranted(true);
                window.stream = stream;
                setLocalStream(stream);
            }).catch(error => {
                setUserMediaError(error);
                console.log("error in use localStream", error);
            });
        }
    },[mediaConstraints]);
  
    return { permissionGranted, userMediaError, localStream };
}