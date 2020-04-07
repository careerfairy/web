import { useState, useEffect } from 'react';
import { navigator, document } from 'global';
import axios from 'axios';

import { WebRTCAdaptor } from '../../static-js/webrtc_adaptor.js';
import { WEBRTC_ERRORS } from '../../data/errors/StreamingErrors.js';

export default function useWebRTCAdaptor(isPlayMode, videoId, mediaConstraints, streamingCallbackObject, errorCallbackObject) {

    const [webRTCAdaptor, setWebRTCAdaptor] = useState(null);

    const [nsToken, setNsToken] = useState(null);

    useEffect(() => {
        axios({
            method: 'get',
            url: 'https://us-central1-careerfairy-e1fd9.cloudfunctions.net/getXirsysNtsToken',
        }).then( token => {                 
                setNsToken(convertTokenFromXirsysApi(token));
            }).catch(error => {
                console.log(error);
        });
    }, []);

    useEffect(() => {
        if (document) {
            setupWebRTCAdaptor();
        }
    }, [mediaConstraints, document]);

    function convertTokenFromXirsysApi(token) {
        let tempToken = token.data.v;
        let iceServers = [];
        tempToken.iceServers.urls.forEach(url => {
            iceServers.push({
                urls: [ url ],
                username: tempToken.iceServers.username,
                credential: tempToken.iceServers.credential
            });
        });
        tempToken.iceServers = iceServers;
        return tempToken;
    }

    function streamingCallback(info, infoObj) {
        switch(info) {
            case "initialized": {
                streamingCallbackObject.onInitialized();
                break;
            }
            case "joinedTheRoom": {
                console.log(infoObj)
                streamingCallbackObject.onRoomJoined();
                break;
            }
            case "streamJoined": {
                console.log(info)
                console.log(infoObj)
                break;
            }
            case "publish_started": {
                streamingCallbackObject.onPublishStarted();
                break;
            }
            case "publish_finished": {
                streamingCallbackObject.onPublishFinished();
                break;
            }
            case "screen_share_stopped": {
                streamingCallbackObject.onScreenShareStopped();
                break;
            }
            case "closed": {
                streamingCallbackObject.onClosed();
                break;
            }
            case "updated_stats": {
                streamingCallbackObject.onUpdatedStats();
                break;
            }
            case "pong": {
                break;
            }
            default: {
                console.log(info);
                console.log(infoObj);
            }
        }
    }

    function errorCallback(error) {
        if (error === 'ScreenSharePermissionDenied') {
            errorCallbackObject.onScreenSharePermissionDenied();
        } else {
            const currentError = WEBRTC_ERRORS.find( webrtc_error => webrtc_error.value === error);
            if (currentError) {
                alert(currentError.text);
            } else {
                alert(error);
            }
        }
    }

    function setupWebRTCAdaptor() {
        var pc_config = nsToken ? { 'iceServers' : nsToken.iceServers } : null; 

        var sdpConstraints = {
            OfferToReceiveAudio : isPlayMode,
            OfferToReceiveVideo : isPlayMode
        };

        const newAdaptor = new WebRTCAdaptor({
            websocket_url : "wss://thrillin.work/WebRTCAppEE/websocket",
            mediaConstraints : mediaConstraints,
            peerconnection_config : pc_config,
            sdp_constraints : sdpConstraints,
            localVideoId : isPlayMode ? null : videoId,
            remoteVideoId : isPlayMode ? videoId : null,
            callback : (info, infoObj) => streamingCallback(info, infoObj),
            callbackError : (error) => errorCallback(error)
        });
        setWebRTCAdaptor(newAdaptor);
    }
  
    return webRTCAdaptor;
}