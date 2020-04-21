import { useState, useEffect } from 'react';
import { navigator, document } from 'global';
import axios from 'axios';

import { WebRTCAdaptor } from '../../static-js/webrtc_adaptor.js';
import { WEBRTC_ERRORS } from '../../data/errors/StreamingErrors.js';

export default function useWebRTCAdaptor(videoId, mediaConstraints, streamingCallbackObject, errorCallbackObject) {

    const [webRTCAdaptor, setWebRTCAdaptor] = useState(null);
    
    const [externalMediaStreams, setExternalMediaStreams] = useState([]);
    const [addedStream, setAddedStream] = useState(null);
    const [removedStream, setRemovedStream] = useState(null);

    const [nsToken, setNsToken] = useState(null);

    const [roomId, setRoomId] = useState(null);
    const [streamId, setStreamId] = useState(null);

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
        setStreamId(infoObj.streamId);
        setRoomId(infoObj.ATTR_ROOM_NAME);
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
            OfferToReceiveAudio : false,
            OfferToReceiveVideo : false
        };

        const newAdaptor = new WebRTCAdaptor({
            websocket_url : "wss://thrillin.work/WebRTCAppEE/websocket",
            mediaConstraints : mediaConstraints,
            peerconnection_config : pc_config,
            sdp_constraints : sdpConstraints,
            localVideoId : videoId,
            debug: true,
            callback : function (info, infoObj) {
                switch(info) {
                    case "initialized": {
                        if (typeof streamingCallbackObject.onInitialized === 'function') {
                            streamingCallbackObject.onInitialized(infoObj);
                        }
                        break;
                    }
                    case "joinedTheRoom": {
                        if (typeof streamingCallbackObject.onJoinedTheRoom === 'function') {
                            streamingCallbackObject.onJoinedTheRoom(infoObj);
                        }
                        publishNewStream(this, infoObj);
                        break;
                    }
                    case "streamJoined": {
                        if (typeof streamingCallbackObject.onStreamJoined === 'function') {
                            streamingCallbackObject.onStreamJoined(infoObj);
                        }
                        playNewStream(this, infoObj);
                        break;
                    }
                    case "streamLeaved": {
                        if (typeof streamingCallbackObject.onStreamLeaved === 'function') {
                            streamingCallbackObject.onStreamLeaved(infoObj);
                        }
                        setRemovedStream(infoObj);
                        break;
                    }
                    case "newStreamAvailable": {
                        if (typeof streamingCallbackObject.onNewStreamAvailable === 'function') {
                            streamingCallbackObject.onNewStreamAvailable(infoObj);
                        }
                        setAddedStream(infoObj);
                        break;
                    }
                    case "publish_started": {
                        if (typeof streamingCallbackObject.onPublishStarted === 'function') {
                            streamingCallbackObject.onPublishStarted(infoObj);
                        }
                        break;
                    }
                    case "publish_finished": {
                        if (typeof streamingCallbackObject.onPublishFinished === 'function') {
                            streamingCallbackObject.onPublishFinished(infoObj);
                        }
                        break;
                    }
                    case "screen_share_stopped": {
                        if (typeof streamingCallbackObject.onScreenShareStopped === 'function') {
                            streamingCallbackObject.onScreenShareStopped(infoObj);
                        }
                        break;
                    }
                    case "closed": {
                        if (typeof streamingCallbackObject.onClosed === 'function') {
                            streamingCallbackObject.onClosed(infoObj);
                        }
                        break;
                    }
                    case "ice_connection_state_changed": {
                        if (typeof streamingCallbackObject.onIceConnectionState === 'function') {
                            streamingCallbackObject.onIceConnectionState(infoObj);
                        }
                        if (infoObj.state == 'disconnected') {
                            this.joinRoom(roomId, streamId);
                        }
                        break;
                    }
                    case "updated_stats": {
                        if (typeof streamingCallbackObject.onUpdatedStats === 'function') {
                            streamingCallbackObject.onUpdatedStats(infoObj);
                        }
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