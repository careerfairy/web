import { useState, useEffect } from "react";
import axios from 'axios';

export function useAgoraToken(roomId, uid, isStreamer, isScreenShareToken) {

    const [agoraToken, setAgoraToken] = useState(null);
  
    useEffect(() => {
        if (roomId && uid) { 
            axios({
                method: 'post',
                data: {
                    isStreamer: isStreamer,
                    uid: isScreenShareToken ? uid + 'screen' : uid,
                    channel: roomId,
                },
                url: `https://us-central1-careerfairy-e1fd9.cloudfunctions.net/generateAgoraToken`,
            }).then( response => { 
                    console.log(response);
                    if (response.data) {
                        setAgoraToken(response.data);
                    }
                }).catch(error => {
                    console.log(error);
            });
        }
    }, [roomId, uid]);
  
    return agoraToken;
}