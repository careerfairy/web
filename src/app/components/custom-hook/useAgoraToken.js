import { useState, useEffect } from "react";
import axios from 'axios';

export function useAgoraToken(roomId, uid, isStreamer, securityToken, isScreenShareToken) {

    const [agoraToken, setAgoraToken] = useState(null);
  
    useEffect(() => {
        if (roomId && uid) { 
            axios({
                method: 'post',
                data: {
                    isStreamer: isStreamer,
                    uid: isScreenShareToken ? uid + 'screen' : uid,
                    token: securityToken,
                    channel: roomId
                },
                url: `http://localhost:5001/careerfairy-e1fd9/us-central1/generateAgoraTokenSecure`,
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