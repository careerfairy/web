import { useState, useEffect } from "react";
import axios from 'axios';

export function useAgoraToken(roomId, isStreamer) {

    const [agoraToken, setAgoraToken] = useState(null);
  
    useEffect(() => {
        if (roomId) {     
            axios({
                method: 'post',
                data: {
                    isStreamer: isStreamer,
                    channel: roomId,
                },
                url: `http://localhost:5001/careerfairy-e1fd9/us-central1/generateAgoraToken`,
            }).then( response => { 
                    console.log(response);
                    if (response.data.token) {
                        setAgoraToken(response.data.token);
                    }
                }).catch(error => {
                    console.log(error);
            });
        }
    }, [roomId]);
  
    return agoraToken;
}