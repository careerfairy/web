import { useState, useEffect } from 'react';
import { navigator, document } from 'global';
import axios from 'axios';

import { WebRTCAdaptor } from '../../static-js/webrtc_adaptor.js';
import { WEBRTC_ERRORS } from '../../data/errors/StreamingErrors.js';

export default function useWebRTCAdaptor(isPlayMode, videoId, mediaConstraints, streamingCallbackObject, errorCallbackObject) {

    const [webRTCAdaptor, setWebRTCAdaptor] = useState(null);
    
    const [externalMediaStreams, setExternalMediaStreams] = useState([]);
    const [addedStream, setAddedStream] = useState(null);
    const [removedStream, setRemovedStream] = useState(null);

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
        if (document && mediaConstraints) {
            setupWebRTCAdaptor();
        }
    }, [mediaConstraints, document]);

    useEffect(() => {
        if (addedStream) {
            debugger;
            let cleanedExternalMediaStreams = removeStreamFromList(addedStream, externalMediaStreams)
            setExternalMediaStreams([...cleanedExternalMediaStreams, addedStream]);
        }
    }, [addedStream]);

    useEffect(() => {
        if (removedStream) {
            setExternalMediaStreams(removeStreamFromList(removedStream, externalMediaStreams));
        }
    }, [removedStream]);

    function removeStreamFromList(stream, streamList) {
        const streamListCopy = [...streamList];
        const streamEntry = streamListCopy.find( entry => {
            return entry.streamId === stream.streamId;
        });
        if (streamEntry) {
            streamListCopy.splice(streamListCopy.indexOf(streamEntry), 1);
        }
        return streamListCopy;
    }

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

    function publishNewStream(adaptorInstance, infoObj) {
        adaptorInstance.publish(infoObj.streamId, 'null', infoObj.ATTR_ROOM_NAME);
        if (infoObj.streams && infoObj.streams.length > 0) {
            infoObj.streams.forEach( streamId => {
                adaptorInstance.play(streamId, "null", infoObj.ATTR_ROOM_NAME);
            })
        }
    }

    function playNewStream(adaptorInstance, infoObj) {
        adaptorInstance.play(infoObj.streamId, 'null', infoObj.ATTR_ROOM_NAME);
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
            remoteVideoId: isPlayMode ? videoId : null,
            debug: true,
            callback : function (info, infoObj) {
                console.log(info);
                switch(info) {
                    case "initialized": {
                        streamingCallbackObject.onInitialized();
                        break;
                    }
                    case "joinedTheRoom": {
                        publishNewStream(this, infoObj);
                        break;
                    }
                    case "streamJoined": {
                        playNewStream(this, infoObj);
                        break;
                    }
                    case "streamLeaved": {
                        setRemovedStream(infoObj);
                        break;
                    }
                    case "newStreamAvailable": {
                        setAddedStream(infoObj);
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
            },
            callbackError : function(error) {
                errorCallback(error)
            }
        });
        setWebRTCAdaptor(newAdaptor);
    }
  
    return { webRTCAdaptor, externalMediaStreams };
}