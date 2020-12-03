import { useState, useEffect } from "react";
import axios from 'axios';

export function useAgoraToken(roomId, uid, isStreamer, shouldFetch) {

    const [agoraToken, setAgoraToken] = useState(null);
  
    useEffect(() => {
        if (roomId && uid && shouldFetch) { 
            axios({
                method: 'post',
                data: {
                    isStreamer: isStreamer,
                    uid: uid,
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
    }, [roomId, uid, shouldFetch]);
  
    return agoraToken;
}