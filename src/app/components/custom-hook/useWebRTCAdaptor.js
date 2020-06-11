import { useState, useEffect } from 'react';
import { navigator, document } from 'global';
import axios from 'axios';

import { WebRTCAdaptor } from '../../static-js/webrtc_adaptor.js';
import { WEBRTC_ERRORS } from '../../data/errors/StreamingErrors.js';
import LivestreamId from '../../pages/upcoming-livestream/[livestreamId].js';

export default function useWebRTCAdaptor(streamerReady, isPlayMode, videoId, mediaConstraints, streamingCallbackObject, errorCallbackObject, roomId, streamId) {

    const [webRTCAdaptor, setWebRTCAdaptor] = useState(null);
    
    const [externalMediaStreams, setExternalMediaStreams] = useState([]);
    const [addedStream, setAddedStream] = useState(null);
    const [removedStream, setRemovedStream] = useState(null);
    const [playFinishedStream, setPlayFinishedStream] = useState(null);

    const [latestAudioLevel, setLatestAudioLevel] = useState(null);
    const [audioLevels, setAudioLevels] = useState([]);

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
        if (streamerReady && document && mediaConstraints && nsToken && nsToken.iceServers) {
            setupWebRTCAdaptor();
        }
    }, [streamerReady, mediaConstraints, document, nsToken]);

    useEffect(() => {
        if (addedStream) {
            let cleanedExternalMediaStreams = removeStreamFromList(addedStream, externalMediaStreams)
            setExternalMediaStreams([...cleanedExternalMediaStreams, addedStream]);
        }
    }, [addedStream]);

    useEffect(() => {
        if (removedStream) {
            setExternalMediaStreams(removeStreamFromList(removedStream, externalMediaStreams));
            setAudioLevels(removeStreamFromList(removedStream, audioLevels));
        }
    }, [removedStream]);

    useEffect(() => {
        if (playFinishedStream) {
            if (externalMediaStreams.some(stream => stream.streamId === playFinishedStream.streamId)) {
                webRTCAdaptor.play(playFinishedStream.streamId, roomId);
            }
        }
    }, [playFinishedStream]);

    useEffect(() => {
        if (latestAudioLevel) {
            updateAudioLevel(latestAudioLevel);
        }
    }, [latestAudioLevel]);

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
        if (error === 'ScreenSharePermissionDenied' && typeof streamingCallbackObject.onScreenSharePermissionDenied === 'function') {
            errorCallbackObject.onScreenSharePermissionDenied();
        } else {
            const currentError = WEBRTC_ERRORS.find( webrtc_error => webrtc_error.value === error);
            if (currentError) {
                if (typeof errorCallbackObject.onOtherError === 'function') {
                    errorCallbackObject.onOtherError(currentError.text);
                } else {
                    alert(currentError.text);
                }
            } else {
                if (typeof errorCallbackObject.onOtherError === 'function') {
                    errorCallbackObject.onOtherError(error);
                } else {
                    alert(error);
                }
            }
        }
    }

    function publishNewStream(adaptorInstance, infoObj) {
        adaptorInstance.publish(infoObj.streamId, 'null', infoObj.ATTR_ROOM_NAME);
    }

    function playIncumbentStreams(adaptorInstance, infoObj) {
        if (infoObj.streams && infoObj.streams.length > 0) {
            infoObj.streams.filter((streamId, index, streams) => streams.indexOf(streamId) === index).forEach( streamId => {
                adaptorInstance.play(streamId, "null", infoObj.ATTR_ROOM_NAME);
                adaptorInstance.enableStats(streamId);
            })
        }
    }

    function playNewStream(adaptorInstance, infoObj) {
        adaptorInstance.play(infoObj.streamId, 'null', infoObj.ATTR_ROOM_NAME);
        adaptorInstance.enableStats(infoObj.streamId);
    }

    function updateAudioLevel(latestAudioLevel) {
        let newAudioLevels = [];
        audioLevels.forEach( level => {
            if (level.streamId !== latestAudioLevel.streamId) {
                newAudioLevels.push(level);
            }
        });
        newAudioLevels.push(latestAudioLevel);
        setAudioLevels(newAudioLevels);
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
            isPlayMode: isPlayMode,
            localVideoId : videoId,
            debug: true,
            callback : function (info, infoObj) {
                switch(info) {
                    case "initialized": {
                        if (typeof streamingCallbackObject.onInitialized === 'function') {
                            streamingCallbackObject.onInitialized(infoObj);
                        }
                        setTimeout(() => {
                            if (!isPlayMode) {
                                this.joinRoom(roomId, streamId);
                            } else {
                                this.joinRoom(roomId);
                            }
                        }, 2000);
                        break;
                    }
                    case "joinedTheRoom": {
                        if (typeof streamingCallbackObject.onJoinedTheRoom === 'function') {
                            streamingCallbackObject.onJoinedTheRoom(infoObj);
                        }
                        if (!isPlayMode) {
                            publishNewStream(this, infoObj);
                        }
                        playIncumbentStreams(this, infoObj);
                        break;
                    }
                    case "streamJoined": {
                        if (typeof streamingCallbackObject.onStreamJoined === 'function') {
                            streamingCallbackObject.onStreamJoined(infoObj);
                        }
                        setTimeout(() => {
                            playNewStream(this, infoObj);
                        }, 500);                        
                        break;
                    }
                    case "streamLeaved": {
                        if (typeof streamingCallbackObject.onStreamLeaved === 'function') {
                            streamingCallbackObject.onStreamLeaved(infoObj);
                        }
                        setRemovedStream(infoObj);
                        this.disableStats(infoObj.streamId);
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
                        if (!isPlayMode) {
                            this.enableStats(infoObj.streamId);
                        }
                        break;
                    }
                    case "publish_finished": {
                        if (typeof streamingCallbackObject.onPublishFinished === 'function') {
                            streamingCallbackObject.onPublishFinished(infoObj);
                        }
                        if (!isPlayMode) {
                            this.joinRoom(roomId, streamId);
                        }
                        break;
                    }
                    case "play_started": {
                        if (typeof streamingCallbackObject.onPlayStarted === 'function') {
                            streamingCallbackObject.onPlayStarted(infoObj);
                        }
                        break;
                    }
                    case "play_finished": {
                        if (typeof streamingCallbackObject.onPlayFinished === 'function') {
                            streamingCallbackObject.onPlayFinished(infoObj);
                        }
                        setPlayFinishedStream(infoObj);
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
                        if (infoObj.state === 'connected') {
                            if (typeof streamingCallbackObject.onConnected === 'function') {
                                streamingCallbackObject.onConnected(infoObj);
                            }
                        }
                        if (infoObj.state === 'disconnected') {
                            if (typeof streamingCallbackObject.onDisconnected === 'function') {
                                streamingCallbackObject.onDisconnected(infoObj);
                            }
                        }
                        break;
                    }
                    case "updated_stats": {
                        if (typeof streamingCallbackObject.onUpdatedStats === 'function') {
                            streamingCallbackObject.onUpdatedStats(infoObj);
                        }
                        setLatestAudioLevel({ streamId: infoObj.streamId, audioLevel: infoObj.audioLevel });
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
  
    return { webRTCAdaptor, externalMediaStreams, audioLevels };
}