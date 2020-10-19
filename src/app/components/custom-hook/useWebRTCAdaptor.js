import { useState, useEffect } from 'react';
import { navigator, document } from 'global';
import axios from 'axios';
import { WebRTCAdaptor } from 'static-js/webrtc_adaptor_new2.js';
import { WEBRTC_ERRORS } from 'data/errors/StreamingErrors.js';

export default function useWebRTCAdaptor(streamerReady, isPlayMode, videoId, mediaConstraints, streamingCallbackObject, errorCallbackObject, roomId, streamId) {

    const [webRTCAdaptor, setWebRTCAdaptor] = useState(null);
    
    const [localStreams, setLocalStreams] = useState([]);
    const [streamsInRoom, setStreamsInRoom] = useState([]);

    const [addedStream, setAddedStream] = useState(null);
    const [externalMediaStreams, setExternalMediaStreams] = useState([]);

    const [streamsToRemove, setStreamsToRemove] = useState([]);
    const [audioLevels, setAudioLevels] = useState([]);
    const [latestAudioLevel, setLatestAudioLevel] = useState(null);
    const [playFinishedStream, setPlayFinishedStream] = useState(null);

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
        if (streamsInRoom && streamsInRoom.length) {
            if (localStreams && localStreams.length) {
                let streamToRemove = [];
                localStreams.forEach( stream => {
                    if (!streamsInRoom.includes(stream)) {
                        streamToRemove.push(stream);
                    }
                });
                setStreamsToRemove(streamToRemove);
            }
            setLocalStreams(streamsInRoom);
        }
    }, [streamsInRoom]);

    useEffect(() => {
        if (localStreams && localStreams.length) {
            localStreams.forEach( stream => {
                webRTCAdaptor.play(stream, 'null', roomId);
            })
        }
    }, [localStreams]);

    useEffect(() => {
        if (addedStream) {
            let cleanedExternalMediaStreams = removeStreamFromList(addedStream, externalMediaStreams)
            setExternalMediaStreams([...cleanedExternalMediaStreams, addedStream]);
        }
    }, [addedStream]);

    useEffect(() => {
        if (streamsToRemove && streamsToRemove.length) {
            setExternalMediaStreams(removeStreamsFromList(streamsToRemove, externalMediaStreams));
            setAudioLevels(removeStreamsFromList(streamsToRemove, audioLevels));
        }
    }, [streamsToRemove]);

    useEffect(() => {
        if (streamerReady && document && mediaConstraints && nsToken && nsToken.iceServers) {
            const adaptor = getWebRTCAdaptor();
            setWebRTCAdaptor(adaptor);
        }
    }, [streamerReady, mediaConstraints, document, nsToken, isPlayMode]);

    useEffect(() => {
        if (playFinishedStream) {
            setStreamsToRemove([playFinishedStream])
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

    function removeStreamFromExternalMediaStreams(streamId) {
        console.log("removeStreamFromExternalMediaStreams was called");
        webRTCAdaptor.stop(streamId);
        const externalMediaStreamsListCopy = [...externalMediaStreams];
        const localStreamsListCopy = localStreams.filter( localStreamId => localStreamId !== streamId);
        const streamEntry = externalMediaStreamsListCopy.find( entry => {
            return entry.streamId === streamId;
        });
        if (streamEntry) {
            externalMediaStreamsListCopy.splice(externalMediaStreamsListCopy.indexOf(streamEntry), 1);
        }
        
        setExternalMediaStreams([...externalMediaStreamsListCopy]);
        setLocalStreams([...localStreamsListCopy]);
    } 

    function removeStreamsFromList(streams, streamList) {
        let filteredList = streamList.filter( entry => {
                return !streams.includes(entry.streamId);
            });
        return filteredList;
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
        adaptorInstance.publish(streamId, 'null', infoObj.ATTR_ROOM_NAME);
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

    function getWebRTCAdaptor() {
        var pc_config = nsToken ? { 'iceServers' : nsToken.iceServers } : null; 

        var sdpConstraints = {
            OfferToReceiveAudio : false,
            OfferToReceiveVideo : false
        };
        const newAdaptor = new WebRTCAdaptor({
            websocket_url : "wss://streaming.careerfairy.io/WebRTCAppEE/websocket",
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
                                console.log("joiningTheRoom");
                            } else {
                                this.joinRoom(roomId);
                            }
                        }, 400);                        
                        break;
                    }
                    case "joinedTheRoom": {
                        if (typeof streamingCallbackObject.onJoinedTheRoom === 'function') {
                            streamingCallbackObject.onJoinedTheRoom(infoObj);
                        }
                        if (!isPlayMode) {
                            publishNewStream(this, infoObj);
                        }
                        this.getRoomInfo(infoObj.ATTR_ROOM_NAME, infoObj.streamId);
                        console.log("joinedTheRoom", infoObj);
                        break;
                    }
                    case "newStreamAvailable": {
                        if (typeof streamingCallbackObject.onNewStreamAvailable === 'function') {
                            streamingCallbackObject.onNewStreamAvailable(infoObj);
                        }
                        setAddedStream(infoObj);
                        this.enableStats(infoObj.streamId);
                        console.log("newStreamAvailable", infoObj);
                        break;
                    }
                    case "roomInformation": {
                        if (typeof streamingCallbackObject.onNewStreamAvailable === 'function') {
                            streamingCallbackObject.onNewStreamAvailable(infoObj);
                        }
                        setStreamsInRoom(infoObj.streams);
                        console.log("roomInformation", infoObj);
                        break;
                    }
                    case "leavedFromRoom": {
                        if (typeof streamingCallbackObject.onNewStreamAvailable === 'function') {
                            streamingCallbackObject.onNewStreamAvailable(infoObj);
                        }
                        debugger;
                        setTimeout(() => {
                            if (!isPlayMode) {
                                this.joinRoom(roomId, streamId);
                            } else {
                                this.joinRoom(roomId);
                            }
                        }, 400); 
                        console.log("leavedFromRoom", infoObj);
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
                        setPlayFinishedStream(infoObj.streamId);               
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
                        this.closeWebSocket();
                        break;
                    }
                    case "ice_connection_state_changed": {
                        if (infoObj.streamId === streamId && infoObj.state === 'connected') {
                            if (typeof streamingCallbackObject.onConnected === 'function') {
                                streamingCallbackObject.onConnected(infoObj);
                            }
                        }
                        if (infoObj.streamId === streamId && infoObj.state === 'disconnected') {
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
        return newAdaptor;
    }
  
    return { webRTCAdaptor, externalMediaStreams, removeStreamFromExternalMediaStreams, audioLevels };
}