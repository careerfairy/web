import { useState, useEffect } from "react";
import axios from 'axios';

export function useNumberOfViewers(currentLivestream) {

    const [numberOfViewers, setNumberOfViewers] = useState(0);
  
    useEffect(() => {
        if (currentLivestream && currentLivestream.id) {     
            clearInterval();
            if (currentLivestream.hasStarted) {
                setInterval(() => {
                    axios({
                        method: 'get',
                        url: 'https://streaming.careerfairy.io/WebRTCAppEE/rest/v2/broadcasts/' + currentLivestream.id,
                    }).then( response => { 
                            if (response.data.webRTCViewerCount > -1) {
                                setNumberOfViewers(response.data.webRTCViewerCount);
                            }
                        }).catch(error => {
                            console.log(error);
                    });
                }, 10000);
            } else {
                setNumberOfViewers(0);
            }
        }
    }, [currentLivestream, currentLivestream.hasStarted]);
  
    return numberOfViewers;
  }