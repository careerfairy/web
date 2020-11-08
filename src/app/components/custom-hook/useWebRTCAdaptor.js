import { useState, useEffect } from 'react';
import window, { navigator, document } from 'global';
import axios from 'axios';
import { WebRTCAdaptor } from 'static-js/webrtc_adaptor_new2.js';
import { WEBRTC_ERRORS } from 'data/errors/StreamingErrors.js';

export default function useWebRTCAdaptor(streamerReady, isPlayMode, videoId, mediaConstraints, streamingCallbackObject, errorCallbackObject, roomId, streamId) {

    const [webRTCAdaptor, setWebRTCAdaptor] = useState(null);
    const [streamsList, setStreamsList] = useState([]);
    const [localMediaStream, setLocalMediaStream] = useState(null);

    const [addedStream, setAddedStream] = useState(null);
    const [externalMediaStreams, setExternalMediaStreams] = useState([]);


    const [audioLevels, setAudioLevels] = useState([]);
    const [latestAudioLevel, setLatestAudioLevel] = useState(null);

    const [nsToken, setNsToken] = useState(null);

    var isChromium = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

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
        if (addedStream) {
            let cleanedExternalMediaStreams = removeStreamFromList(addedStream, externalMediaStreams)
            setExternalMediaStreams([...cleanedExternalMediaStreams, addedStream]);
        }
    }, [addedStream]);


    useEffect(() => {
        if (!isPlayMode) {
            if (document && mediaConstraints && nsToken && nsToken.iceServers && roomId && streamId && isChromium) {
                const adaptor = getWebRTCAdaptor();
                setWebRTCAdaptor(adaptor);
            }
        } else {
            if (document && mediaConstraints && nsToken && nsToken.iceServers && roomId) {
                const adaptor = getWebRTCAdaptor();
                setWebRTCAdaptor(adaptor);
            }
        }     
    }, [mediaConstraints, document, nsToken, isPlayMode, roomId, streamId]);

    useEffect(() => {
        if (webRTCAdaptor && streamerReady && roomId && streamId) {
            if (!isPlayMode) {
                webRTCAdaptor.joinRoom(roomId, streamId);
            } 
        }
    }, [webRTCAdaptor, streamerReady, roomId, streamId]);

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
        const streamEntry = externalMediaStreamsListCopy.find( entry => {
            return entry.streamId === streamId;
        });
        if (streamEntry) {
            externalMediaStreamsListCopy.splice(externalMediaStreamsListCopy.indexOf(streamEntry), 1);
        }
        
        setExternalMediaStreams([...externalMediaStreamsListCopy]);
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
                        if (!isPlayMode) {
                            setLocalMediaStream(this.getLocalStream());                        
                        } else {
                            this.joinRoom(roomId);
                        }
                        break;
                    }
                    case "joinedTheRoom": {
                        if (typeof streamingCallbackObject.onJoinedTheRoom === 'function') {
                            streamingCallbackObject.onJoinedTheRoom(infoObj);
                        }
                        if (!isPlayMode) {
                            publishNewStream(this, infoObj);
                        }
                        var adaptor = this;
                        if (infoObj.streams != null) {
							infoObj.streams.forEach( stream => {
								adaptor.play(stream, null, roomId);
							});
                            setStreamsList(infoObj.streams);
						}
                        this.getRoomInfo(infoObj.ATTR_ROOM_NAME, infoObj.streamId);
                        break;
                    }
                    case "newStreamAvailable": {
                        if (typeof streamingCallbackObject.onNewStreamAvailable === 'function') {
                            streamingCallbackObject.onNewStreamAvailable(infoObj);
                        }
                        setAddedStream(infoObj);
                        this.enableStats(infoObj.streamId);
                        break;
                    }
                    case "roomInformation": {
                        if (typeof streamingCallbackObject.onNewStreamAvailable === 'function') {
                            streamingCallbackObject.onNewStreamAvailable(infoObj);
                        }
                        var adaptor = this;
                        var tempRoomStreamList = [];
	
						if (streamsList != null) {
							for (let i = 0; i < streamsList.length; i++) {
								var oldStreamListItem = streamsList[i];
								var newRoomItemIndex = infoObj.streams.indexOf(oldStreamListItem);

								if(infoObj.streams.includes(oldStreamListItem)){
									if (newRoomItemIndex > -1) {
                                        infoObj.streams.splice(newRoomItemIndex, 1);
									}
									tempRoomStreamList.push(oldStreamListItem);
								}
								else{
									removeStreamFromExternalMediaStreams(oldStreamListItem.streamId);
								}
							}
						}

						if (infoObj.streams != null) {
							infoObj.streams.forEach( stream => {
								tempRoomStreamList.push(stream);
                                adaptor.play(stream, null, roomId);
                                console.log("playing: " + stream.streamId)
							});
						}
						setStreamsList(tempRoomStreamList);
                        break;
                    }
                    case "leavedFromRoom": {
                        if (typeof streamingCallbackObject.onNewStreamAvailable === 'function') {
                            streamingCallbackObject.onNewStreamAvailable(infoObj);
                        }
                        if (!isPlayMode) {
                            this.joinRoom(roomId, streamId);
                        } else {
                            this.joinRoom(roomId);
                        }
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
                if (error === "ScreenSharePermissionDenied") {
                    if (typeof errorCallbackObject.onScreenSharePermissionDenied === 'function') {
                        errorCallbackObject.onScreenSharePermissionDenied();
                    }
                }
                errorCallback(error)
            }
        });
        return newAdaptor;
    }
    return { webRTCAdaptor, externalMediaStreams, localMediaStream, setAddedStream, removeStreamFromExternalMediaStreams, audioLevels };
}