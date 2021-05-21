import {useCallback, useEffect, useState} from 'react';
import window, {document} from 'global';
import {useAgoraToken} from './useAgoraToken';
import {useDispatch} from "react-redux";
import {EMOTE_MESSAGE_TEXT_TYPE} from "../util/constants";
import * as actions from '../../store/actions'
import {useRouter} from 'next/router';

export default function useAgoraAsStreamer(streamerReady, isPlayMode, videoId, screenSharingMode, roomId, streamId, isViewer, optimizationMode) {

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

    const router = useRouter();
    const token = router.query.token || '';

    const [agoraRTC, setAgoraRTC] = useState(null);
    const [rtcClient, setRtcClient] = useState(null);
    const [screenShareRtcClient, setScreenShareRtcClient] = useState(null);
    const [screenShareRtcStream, setScreenShareRtcStream] = useState(null);

    const [rtmClient, setRtmClient] = useState(null);
    const [rtmChannel, setRtmChannel] = useState(null);

    const [userUid, setUserUid] = useState(null);
    const [readyToConnect, setReadyToConnect] = useState(false);
    const [numberOfViewers, setNumberOfViewers] = useState(0);
    const [agoraRtcStatus, setAgoraRtcStatus] = useState({
        type: "INFO",
        msg: "RTC_INITIAL"
    });
    const [agoraRtmStatus, setAgoraRtmStatus] = useState({
        type: "INFO",
        msg: "RTM_INITIAL"
    });

    const agoraToken = useAgoraToken(roomId, userUid, !isViewer, token, false);
    const agoraScreenShareToken = useAgoraToken(roomId, userUid, !isViewer, token, true);

    const AGORA_APP_ID = "53675bc6d3884026a72ecb1de3d19eb1";

    useEffect(() => {
        if (streamId) {
            setUserUid(streamId)
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
        // console.log("externalMediaStreams", externalMediaStreams);
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

    const createEmote = useCallback(async (emoteType) => {
        try {
            const messageToSend = await dispatch(actions.createEmote(emoteType))
            rtmChannel.sendMessage(messageToSend)
        } catch (e) {
        }
    }, [dispatch, rtmChannel])

    const connectAgoraRTC = () => {

        setAgoraRtcStatus({
            type: "INFO",
            msg: "RTC_INITIALIZING"
        })

        let AgoraRTC = require('agora-rtc-sdk');
        setAgoraRTC(AgoraRTC);
        let rtcClient = AgoraRTC.createClient({
            mode: "live",
            codec: "vp8",
        });
        rtcClient.init(AGORA_APP_ID);
        AgoraRTC.Logger.setLogLevel(AgoraRTC.Logger.ERROR)

        setAgoraRtcStatus({
            type: "INFO",
            msg: "RTC_JOINING_CHANNEL"
        })

        if (!isViewer) {
            rtcClient.startProxyServer(3);
            rtcClient.setClientRole("host")
            rtcClient.join(agoraToken.rtcToken, roomId, userUid, (uid) => {

                setAgoraRtcStatus({
                    type: "INFO",
                    msg: "RTC_JOINED_CHANNEL"
                })

                let localStream = AgoraRTC.createStream({
                    audio: true,
                    video: true
                });
                localStream.setVideoProfile("480p_9");

                setAgoraRtcStatus({
                    type: "INFO",
                    msg: "RTC_REQUEST_MEDIA_ACCESS"
                })

                localStream.init(() => {
                    setAgoraRtcStatus({
                        type: "INFO",
                        msg: "RTC_PUBLISH_STREAM"
                    })

                    localStream.play(videoId);
                    rtcClient.publish(localStream, handleStreamPublishingError)
                    setLocalMediaStream(localStream);
                    // Publish the local stream
                }, handleStreamInitializationError);
            }, handleClientJoinChannelError);


        } else {
            rtcClient.setClientRole("audience");
            rtcClient.join(agoraToken.rtcToken, roomId, userUid, (uid) => {
                setAgoraRtcStatus({
                    type: "INFO",
                    msg: "RTC_STREAM_JOINED_AS_VIEWER"
                });
            }, handleClientJoinChannelError);
        }
        rtcClient.enableAudioVolumeIndicator()


        rtcClient.on("stream-published", function (evt) {
            rtcClient.enableDualStream(() => {
                console.log("-> dualStream enabled on rtc client");
            }, function (err) {
                console.log("-> dualStream failed on rtc client", err);
                setAgoraRtcStatus({
                    type: "WARN",
                    msg: "RTC_DUAL_STREAM_INACTIVE"
                })
            });

            setAgoraRtcStatus({
                type: "INFO",
                msg: "RTC_STREAM_PUBLISHED"
            });
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
                }, handleStreamInitializationError);
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
        // rtcClient.on("peer-online", function (event) {
        //     // PEER ONLINE
        //     console.log("-> peer-online event", event);
        // });

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
            // console.log("volume-indicator", evt)
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

        let rtmClient = AgoraRTM.createInstance(AGORA_APP_ID, {logFilter: AgoraRTM.LOG_FILTER_ERROR})

        rtmClient.on('ConnectionStateChanged', (newState, reason) => {
            if (newState === "DISCONNECTED") {
                setAgoraRtmStatus({
                    type: "INFO",
                    msg: "RTM_DISCONNECTED"
                })
            } else if (newState === "RECONNECTING" && reason === "INTERRUPTED") {
                setAgoraRtmStatus({
                    type: "ERROR",
                    msg: "RTM_NETWORK_INTERRUPTED"
                })
            } else if (newState === "CONNECTED") {
                setAgoraRtmStatus({
                    type: "INFO",
                    msg: "RTM_CONNECTED"
                })
            }

        });

        let rtmCredentials = {
            token: agoraToken.rtmToken,
            uid: userUid
        }


        rtmClient.login(rtmCredentials).then(() => {

            const channel = rtmClient.createChannel(roomId);




            channel.on('ChannelMessage', (message, memberId) => {
                if (message.messageType === "TEXT") {
                    const messageData = JSON.parse(message.text)
                    if (messageData.textType === EMOTE_MESSAGE_TEXT_TYPE) {
                        dispatch(actions.setEmote(messageData, memberId))
                    }
                }
            });

            channel.join().then(() => {

                console.log('Joined channel');
                // channel.getMembers().then(result => {
                //     console.log("-> getMembers result", result);
                // })
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
                    screenShareClient.startProxyServer(3);

                    screenShareClient.init(AGORA_APP_ID, () => {
                        publishScreenShareStream(screenShareClient)
                    });


                    setScreenShareRtcClient(screenShareClient);
                } else {
                    publishScreenShareStream(screenShareRtcClient)
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

    const publishScreenShareStream = (client) => {
        client.join(agoraScreenShareToken.rtcToken, roomId, userUid + 'screen', (uid) => {

            let screenShareStream = agoraRTC.createStream({
                streamID: uid,
                audio: false,
                video: false,
                screen: true,
                screenAudio: true,
                optimizationMode: screenSharingMode
            });

            if (screenSharingMode === 'motion') {
                screenShareStream.setScreenProfile("720p_2")
            } else {
                screenShareStream.setScreenProfile("1080p_1");
            }
            setAgoraRtcStatus({
                type: "INFO",
                msg: "RTC_SCREEN_SHARE_STARTED"
            })

            screenShareStream.init(() => {
                screenShareStream.play("Screen");
                client.publish(screenShareStream, handleStreamPublishingError);
                setScreenShareRtcStream(screenShareStream);
            }, (err) => {
                if (err) {
                    if (err.type === "error" && err.msg === "NotAllowedError" && err.info === "Permission denied by system") {
                        setAgoraRtcStatus({
                            type: "ERROR",
                            msg: "RTC_SCREEN_SHARE_NOT_ALLOWED"
                        })
                    } else if (err.type === "error" && err.msg === "NotAllowedError") {
                        setAgoraRtcStatus({
                            type: "INFO",
                            msg: "RTC_SCREEN_SHARE_STOPPED"
                        })
                    } else {
                        handleStreamInitializationError(err)
                    }
                }
            });
            screenShareStream.on("stopScreenSharing", function (evt) {
                setAgoraRtcStatus({
                    type: "INFO",
                    msg: "RTC_SCREEN_SHARE_STOPPED"
                })
            });
        }, handleClientJoinChannelError);

        // DUAL STREAM MAYBE NOT SUPPORT FOR SCREEN SHARE?!
        // client.enableDualStream(() => {
        //     console.log("-> screenShareDualStream enabled ");
        // }, function (err) {
        //     console.log("-> screenShareDualStream failed ", err);
        //     setAgoraRtcStatus({
        //         type: "WARN",
        //         msg: "RTC_DUAL_STREAM_INACTIVE"
        //     })
        // });
    }

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
                    // console.log(result)
                })
            }, 5000)
            return () => clearInterval(interval);
        }
    }, [rtmChannel])

    const removeStreamFromList = (streamId, streamList) => {
        const streamListCopy = [...streamList];
        const streamEntry = streamListCopy.find(entry => {
            return entry.streamId === streamId;
        });
        if (streamEntry) {
            streamListCopy.splice(streamListCopy.indexOf(streamEntry), 1);
        }
        return streamListCopy;
    }

    const handleError = (err) => {
        console.log("Error: ", err);
    };

    const handleClientJoinChannelError = (err) => {
        if (err) {
            if (err.type === "error") {
                if (err.msg === "INVALID_OPERATION") {
                    setAgoraRtcStatus({
                        type: "ERROR",
                        msg: "RTC_JOIN_INVALID_OPERATION"
                    })
                } else if (err.msg === "UID_CONFLICT") {
                    setAgoraRtcStatus({
                        type: "ERROR",
                        msg: "RTC_JOIN_UID_CONFLICT"
                    })
                } else if (err.msg === "ERR_REPEAT_JOIN") {
                    setAgoraRtcStatus({
                        type: "ERROR",
                        msg: "RTC_JOIN_ERR_REPEAT_JOIN"
                    })
                } else if (err.msg === "SOCKET_ERROR") {
                    setAgoraRtcStatus({
                        type: "ERROR",
                        msg: "RTC_JOIN_SOCKET_ERROR"
                    })
                } else if (err.msg === "CANNOT_MEET_AREA_DEMAND") {
                    setAgoraRtcStatus({
                        type: "ERROR",
                        msg: "RTC_JOIN_CANNOT_MEET_AREA_DEMAND"
                    })
                }
            }
        }
    };

    const handleStreamInitializationError = (err) => {
        if (err) {
            if (err.type === "error") {
                if (err.msg === "NotAllowedError") {
                    setAgoraRtcStatus({
                        type: "ERROR",
                        msg: "RTC_MEDIA_PERMISSION_DENIED"
                    })
                } else if (err.msg === "MEDIA_OPTION_INVALID") {
                    setAgoraRtcStatus({
                        type: "ERROR",
                        msg: "RTC_MEDIA_OPTION_INVALID"
                    })
                } else if (err.msg === "DEVICES_NOT_FOUND") {
                    setAgoraRtcStatus({
                        type: "ERROR",
                        msg: "RTC_DEVICES_NOT_FOUND"
                    })
                } else if (err.msg === "NOT_SUPPORTED") {
                    setAgoraRtcStatus({
                        type: "ERROR",
                        msg: "RTC_NOT_SUPPORTED"
                    })
                } else if (err.msg === "PERMISSION_DENIED") {
                    setAgoraRtcStatus({
                        type: "ERROR",
                        msg: "RTC_MEDIA_PERMISSION_DENIED"
                    })
                } else if (err.msg === "CONSTRAINT_NOT_SATISFIED") {
                    setAgoraRtcStatus({
                        type: "ERROR",
                        msg: "RTC_CONSTRAINT_NOT_SATISFIED"
                    })
                } else if (err.msg === "UNDEFINED") {
                    setAgoraRtcStatus({
                        type: "ERROR",
                        msg: "RTC_UNDEFINED_ERROR"
                    })
                }
            }
        }
    };

    const handleStreamPublishingError = (err) => {
        if (err) {
            if (err.type === "error") {
                if (err.msg === "STREAM_ALREADY_PUBLISHED") {
                    setAgoraRtcStatus({
                        type: "ERROR",
                        msg: "RTC_STREAM_ALREADY_PUBLISHED"
                    })
                } else if (err.msg === "INVALID_LOCAL_STREAM") {
                    setAgoraRtcStatus({
                        type: "ERROR",
                        msg: "RTC_INVALID_LOCAL_STREAM"
                    })
                } else if (err.msg === "INVALID_OPERATION") {
                    setAgoraRtcStatus({
                        type: "ERROR",
                        msg: "RTC_INVALID_OPERATION"
                    })
                } else if (err.msg === "PUBLISH_STREAM_FAILED") {
                    setAgoraRtcStatus({
                        type: "ERROR",
                        msg: "RTC_PUBLISH_STREAM_FAILED"
                    })
                } else if (err.msg === "PEERCONNECTION_FAILED") {
                    setAgoraRtcStatus({
                        type: "ERROR",
                        msg: "RTC_PEERCONNECTION_FAILED"
                    })
                } else if (err.msg === "REQUEST_ABORT") {
                    setAgoraRtcStatus({
                        type: "ERROR",
                        msg: "RTC_REQUEST_ABORT"
                    })
                }
            }
        }
    };

    return {
        localMediaStream,
        setLocalMediaStream,
        externalMediaStreams,
        agoraRtcStatus,
        agoraRtmStatus,
        networkQuality,
        numberOfViewers,
        setAddedStream,
        setRemovedStream,
        createEmote
    };
}