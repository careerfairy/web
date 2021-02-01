import {useState, useEffect, useContext} from 'react';
import window, {navigator, document} from 'global';
import {v4 as uuidv4} from 'uuid';
import {useAgoraToken} from './useAgoraToken';
import {useDispatch, useSelector} from "react-redux";
import {setRtmChannelObj} from "../../store/actions/rtmChannelActions";
import {setEmote} from "../../store/actions/emotesActions";
import {EMOTE_MESSAGE_TEXT_TYPE} from "../util/constants";

export default function useAgoraAsStreamer(streamerReady, isPlayMode, videoId, screenSharingMode, roomId, streamId, isViewer) {

    const dispatch = useDispatch()
    const [localMediaStream, setLocalMediaStream] = useState(null);
    const [addedStream, setAddedStream] = useState(null);
    const [updatedStream, setUpdatedStream] = useState(null);
    const [removedStream, setRemovedStream] = useState(null);
    const [externalMediaStreams, setExternalMediaStreams] = useState([]);
    const [networkQuality, setNetworkQuality] = useState({
        downlinkNetworkQuality: 0,
        type: "network-quality",
        uplinkNetworkQuality: 0,
    });

    const [agoraRTC, setAgoraRTC] = useState(null);
    const [rtcClient, setRtcClient] = useState(null);
    const [screenShareRtcClient, setScreenShareRtcClient] = useState(null);
    const [screenShareRtcStream, setScreenShareRtcStream] = useState(null);

    const [rtmClient, setRtmClient] = useState(null);
    const [rtmChannel, setRtmChannel] = useState(null);

    const [userUid, setUserUid] = useState(null);
    const [readyToConnect, setReadyToConnect] = useState(false);
    const [numberOfViewers, setNumberOfViewers] = useState(0);

    const [agoraStatus, setAgoraStatus] = useState("initial");
    const [agoraScreenShareStatus, setAgoraScreenShareStatus] = useState("initial");

    const agoraToken = useAgoraToken(roomId, userUid, !isViewer, false);
    const agoraScreenShareToken = useAgoraToken(roomId, userUid, !isViewer, true);

    useEffect(() => {
        if (streamId) {
            const regex = /-/g;
            let joiningId = streamId.replace(regex, '')
            setUserUid(joiningId)
        }
    }, [streamId])

    useEffect(() => {
        if (addedStream) {
            let cleanedExternalMediaStreams = removeStreamFromList(addedStream.streamId, externalMediaStreams)
            setExternalMediaStreams([...cleanedExternalMediaStreams, addedStream]);
        }
    }, [addedStream]);

    useEffect(() => {
        if (updatedStream) {
            let externalMediaStreamsCopy = [...externalMediaStreams]
            externalMediaStreamsCopy.forEach(stream => {
                if (stream.streamId === updatedStream.streamId) {
                    Object.keys(updatedStream.propertiesToUpdate).forEach(key => {
                        stream[key] = updatedStream.propertiesToUpdate[key]
                    })
                }
            })
            setExternalMediaStreams(externalMediaStreamsCopy);
        }
    }, [updatedStream]);

    useEffect(() => {
        console.log("externalMediaStreams", externalMediaStreams);
    }, [externalMediaStreams])

    useEffect(() => {
        if (removedStream) {
            let cleanedExternalMediaStreams = removeStreamFromList(removedStream, externalMediaStreams)
            setExternalMediaStreams([...cleanedExternalMediaStreams]);
        }
        setRemovedStream(null);
    }, [removedStream]);

    useEffect(() => {
        if (window &&
            userUid &&
            streamerReady &&
            roomId &&
            streamId &&
            agoraToken &&
            agoraScreenShareToken &&
            document) {
            setReadyToConnect(true);
        }
    }, [window, userUid, streamerReady, roomId, streamId, agoraToken, agoraScreenShareToken, document])

    useEffect(() => {
        if (readyToConnect) {
            connectAgoraRTC()
            connectAgoraRTM()
        }
    }, [readyToConnect])

    const connectAgoraRTC = () => {
        let AgoraRTC = require('agora-rtc-sdk');
        setAgoraRTC(AgoraRTC);
        let rtcClient = AgoraRTC.createClient({
            mode: "live",
            codec: "vp8",
        });
        rtcClient.init("53675bc6d3884026a72ecb1de3d19eb1");
        //rtcClient.startProxyServer(3);
        setAgoraStatus("joining_channel");
        if (!isViewer) {
            rtcClient.setClientRole("host")
            rtcClient.join(agoraToken.rtcToken, roomId, userUid, (uid) => {
                setAgoraStatus("getting_media_access");
                let localStream = AgoraRTC.createStream({
                    audio: true,
                    video: true
                });
                localStream.setVideoProfile("480p_9");
                localStream.init(() => {
                    setAgoraStatus("publish_stream");
                    localStream.play(videoId);
                    rtcClient.publish(localStream, handleError);
                    rtcClient.enableDualStream(() => {
                        console.log("Enable dual stream success!")
                    }, function (err) {
                        console.log(err)
                    });
                    setLocalMediaStream(localStream);
                    // Publish the local stream
                }, handleError);
            }, handleError);
        } else {
            rtcClient.setClientRole("audience");
            rtcClient.join(agoraToken.rtcToken, roomId, userUid, (uid) => {
            }, handleError);
        }
        rtcClient.enableAudioVolumeIndicator()
        rtcClient.on("stream-published", function (evt) {
            setAgoraStatus("stream_published");
        });
        rtcClient.on("stream-added", function (evt) {
            if (evt.stream.getId() !== userUid + 'screen') {
                rtcClient.subscribe(evt.stream, handleError);
            }
        });
        rtcClient.on("stream-subscribed", function (evt) {
            let stream = evt.stream;
            let streamId = String(stream.getId());
            rtcClient.setStreamFallbackOption(stream, 2);
            setAddedStream({
                streamId: streamId,
                stream: stream,
                streamQuality: 'high',
                videoMuted: false,
                audioMuted: false,
                fallbackToAudio: false
            });
        });
        rtcClient.on("stream-removed", function (evt) {
            console.log("stream-removed")
            if (evt.stream) {
                let stream = evt.stream;
                let streamId = String(stream.getId());
                stream.close();
                setRemovedStream(streamId);
            }
        });
        rtcClient.on("peer-leave", function (evt) {
            console.log("peer-leave")
            if (evt.stream) {
                let stream = evt.stream;
                let streamId = String(stream.getId());
                stream.close();
                setRemovedStream(streamId);
            }
        });
        let localStream = null;
        rtcClient.on("client-role-changed", function (evt) {
            let role = evt.role;
            if (role === 'host') {
                localStream = AgoraRTC.createStream({
                    audio: true,
                    video: true
                });
                localStream.setVideoProfile("480p_9");
                localStream.init(() => {
                    localStream.play(videoId);
                    rtcClient.publish(localStream, handleError);
                    setLocalMediaStream(localStream);
                }, handleError);
            }
            if (role === 'audience') {
                if (localStream) {
                    rtcClient.unpublish(localStream, handleError);
                    localStream.close();
                    setLocalMediaStream(null);
                }
            }
        });
        rtcClient.on("stream-type-changed", evt => {
            // SHOW MESSAGE DESCRIBING THAT THE USER WILL RECEIVE LOW QUALITY STREAMS DUE TO NETWORK CONDITIONS
            console.log("stream-type-changed", evt)
            let streamToUpdate = {
                streamId: evt.uid,
                propertiesToUpdate: {
                    streamQuality: evt.streamType === 0 ? 'high' : 'low'
                }
            }
            setUpdatedStream(streamToUpdate);
        });
        rtcClient.on("stream-fallback", evt => {
            // SHOW MESSAGE DESCRIBING THAT THE USER WILL ONLY RECEIVE AUDIO STREAM DUE TO NETWORK CONDITIONS
            console.log("stream-fallback", evt)
            let streamToUpdate = {
                streamId: evt.uid,
                propertiesToUpdate: {
                    fallbackToAudio: evt.attr === 1 ? true : false
                }
            }
            setUpdatedStream(streamToUpdate);
        });
        rtcClient.on("network-quality", function (networkStats) {
            // NETWORK QUALITY
            setNetworkQuality(networkStats)
        });
        rtcClient.on("mute-audio", function (evt) {
            // STREAMER HAS MUTED AUDIO
            console.log("mute-audio", evt)
            let streamToUpdate = {
                streamId: evt.uid,
                propertiesToUpdate: {
                    audioMuted: true
                }
            }
            setUpdatedStream(streamToUpdate);
        });
        rtcClient.on("unmute-audio", function (evt) {
            // STREAMER HAS UNMUTED AUDIO
            console.log("mute-audio", evt)
            let streamToUpdate = {
                streamId: evt.uid,
                propertiesToUpdate: {
                    audioMuted: false
                }
            }
            setUpdatedStream(streamToUpdate);
        });
        rtcClient.on("mute-video", function (evt) {
            // STREAMER HAS MUTED VIDEO
            console.log("mute-video", evt)
            let streamToUpdate = {
                streamId: evt.uid,
                propertiesToUpdate: {
                    videoMuted: true
                }
            }
            setUpdatedStream(streamToUpdate);
        });
        rtcClient.on("unmute-video", function (evt) {
            // STREAMER HAS MUTED VIDEO
            console.log("unmute-video", evt)
            let streamToUpdate = {
                streamId: evt.uid,
                propertiesToUpdate: {
                    videoMuted: false
                }
            }
            setUpdatedStream(streamToUpdate);
        });
        rtcClient.on("volume-indicator", function (evt) {
            // STREAMER HAS MUTED VIDEO
            console.log("volume-indicator", evt)
        });
        rtcClient.on("reconnect", function (evt) {
            setExternalMediaStreams([]);
        });
        rtcClient.on("exception", function (evt) {
            // NETWORK QUALITY
        });
        setRtcClient(rtcClient);
    }

    const connectAgoraRTM = () => {
        let AgoraRTM = require('agora-rtm-sdk');
        let rtmClient = AgoraRTM.createInstance("53675bc6d3884026a72ecb1de3d19eb1")
        rtmClient.on('ConnectionStateChanged', (newState, reason) => {
            console.log('on connection state changed to ' + newState + ' reason: ' + reason);
        });
        rtmClient.login({token: agoraToken.rtmToken, uid: userUid}).then(() => {
            console.log('AgoraRTM client login success');
            const channel = rtmClient.createChannel(roomId);
            dispatch(setRtmChannelObj(channel))
            channel.on('ChannelMessage', (message, memberId) => {
                if (message.messageType === "TEXT") {
                    const messageData = JSON.parse(message.text)
                    if (messageData.textType === EMOTE_MESSAGE_TEXT_TYPE) {
                        dispatch(setEmote(messageData, memberId))
                    }
                }
            });
            channel.join().then(() => {
                console.log('Joined channel');
                setRtmChannel(channel);
            }).catch(error => {
                console.error(error);
            });
        }).catch(err => {
            console.log('AgoraRTM client login failure', err);
        });
        setRtmClient(rtmClient);
    }

    useEffect(() => {
        if (!isPlayMode) {
            if (agoraRTC && agoraScreenShareToken && screenSharingMode) {
                if (!screenShareRtcClient) {
                    let screenShareClient = agoraRTC.createClient({
                        mode: "live",
                        codec: "vp8",
                    });
                    screenShareClient.setClientRole('host')
                    screenShareClient.init("53675bc6d3884026a72ecb1de3d19eb1", () => {
                        screenShareClient.join(agoraScreenShareToken.rtcToken, roomId, userUid + 'screen', (uid) => {
                            let screenShareStream = agoraRTC.createStream({
                                streamID: uid,
                                audio: false,
                                video: false,
                                screen: true,
                                screenAudio: true
                                //optimizationMode: 'motion'
                            });
                            screenShareStream.setVideoProfile("480p_9");
                            screenShareStream.init(() => {
                                screenShareStream.play("Screen");
                                screenShareClient.publish(screenShareStream, handleError);
                                setScreenShareRtcStream(screenShareStream);
                            }, handleError);
                        }, handleError);
                    });
                    setScreenShareRtcClient(screenShareClient);
                } else {
                    screenShareRtcClient.join(agoraScreenShareToken.rtcToken, roomId, userUid + 'screen', (uid) => {
                        let screenShareStream = agoraRTC.createStream({
                            streamID: uid,
                            audio: false,
                            video: false,
                            screen: true,
                            screenAudio: true
                            //optimizationMode: 'motion'
                        });
                        screenShareStream.setVideoProfile("480p_9");
                        screenShareStream.init(() => {
                            screenShareStream.play("Screen");
                            screenShareRtcClient.publish(screenShareStream, handleError);
                            setScreenShareRtcStream(screenShareStream);
                        }, handleError);
                    });
                }
            } else {
                if (screenShareRtcClient) {
                    if (screenShareRtcStream) {
                        screenShareRtcClient.unpublish(screenShareRtcStream, handleError);
                        screenShareRtcStream.close();
                        setScreenShareRtcStream(null);
                    }
                    screenShareRtcClient.leave();
                }
            }
        }
    }, [agoraRTC, screenSharingMode, isPlayMode, agoraScreenShareToken])

    useEffect(() => {
        if (isViewer && agoraRTC && rtcClient) {
            if (!isPlayMode) {
                rtcClient.setClientRole("host");
            } else {
                rtcClient.setClientRole("audience");
            }
        }
    }, [isPlayMode])

    useEffect(() => {
        if (rtmChannel) {
            let interval = setInterval(() => {
                rtmClient.getChannelMemberCount([roomId]).then(result => {
                    setNumberOfViewers(result[roomId])
                    console.log(result)
                })
            }, 5000)
            return () => clearInterval(interval);
        }
    }, [rtmChannel])

    function removeStreamFromList(streamId, streamList) {
        const streamListCopy = [...streamList];
        const streamEntry = streamListCopy.find(entry => {
            return entry.streamId === streamId;
        });
        if (streamEntry) {
            streamListCopy.splice(streamListCopy.indexOf(streamEntry), 1);
        }
        return streamListCopy;
    }

    let handleError = function (err) {
        console.log("Error: ", err);
    };

    return {localMediaStream, externalMediaStreams, networkQuality, numberOfViewers, setAddedStream, setRemovedStream};
}