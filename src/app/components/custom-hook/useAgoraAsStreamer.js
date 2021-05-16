import {useEffect, useRef, useState} from 'react';
import window, {document} from 'global';
import {useAgoraToken} from './useAgoraToken';
import {useDispatch} from "react-redux";
import {EMOTE_MESSAGE_TEXT_TYPE} from "../util/constants";
import * as actions from '../../store/actions'
import {useRouter} from 'next/router';

export default function useAgoraAsStreamer(streamerReady, isPlayMode, videoId, screenSharingMode, roomId, streamId, isViewer, optimizationMode, setShowVideoButton) {

    const dispatch = useDispatch()
    const [localMediaStream, setLocalMediaStream] = useState(null);

    const [externalUsers, setExternalUsers] = useState([]);
    const externalUsersRef = useRef(externalUsers)

    const updateExternalUsers = (newExternalUsers) => {
        externalUsersRef.current = newExternalUsers
        setExternalUsers(newExternalUsers)
    }

    const [networkQuality, setNetworkQuality] = useState({
        downlinkNetworkQuality: 0,
        type: "network-quality",
        uplinkNetworkQuality: 0,
    });

    const router = useRouter();
    const token = router.query.token || '';

    const [agoraRTC, setAgoraRTC] = useState(null);
    const [rtcClient, setRtcClient] = useState(null);
    const [proxyMode, setProxyMode] = useState(false);
    const [timeoutNumber, setTimeoutNumber] = useState(null);

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
        if (timeoutNumber) {
            clearTimeout(timeoutNumber)
        }
        if (agoraRtcStatus.msg === "RTC_JOINING_CHANNEL" || agoraRtcStatus.msg === "RTC_PUBLISHING_STREAM") {
            let number = setTimeout(() => {
                if (proxyMode === true) {
                    setAgoraRtcStatus({
                        type: "ERROR",
                        msg: "RTC_CONNECTION_ERROR"
                    })
                } else {
                    setProxyMode(true)
                }
            }, 15000);
            setTimeoutNumber(number)
        }   
    }, [agoraRtcStatus])

    useEffect(() => {
        if (readyToConnect) {
            if (rtcClient) {
                rtcClient.leave().then(() => {
                    connectAgoraRTC()
                })
            } else {
                connectAgoraRTC()
            } 
            if (!rtmClient) {
                connectAgoraRTM()      
            }
        }
    }, [readyToConnect, proxyMode])

    const connectAgoraRTC = async () => {

        setAgoraRtcStatus({
            type: "INFO",
            msg: "RTC_INITIALIZING"
        })

        let AgoraRTC = require('agora-rtc-sdk-ng');

        setAgoraRTC(AgoraRTC);

        AgoraRTC.onAudioAutoplayFailed = () => {
            setShowVideoButton({ paused: false, muted: true })
        }

        let rtcClient = AgoraRTC.createClient({
            mode: "live",
            codec: "h264",
        });
        setRtcClient(rtcClient);

        if (proxyMode === true) {
            rtcClient.startProxyServer(3);
        }

        setAgoraRtcStatus({
            type: "INFO",
            msg: "RTC_JOINING_CHANNEL"
        })

        rtcClient.on("user-joined", async (remoteUser) => {
            let cleanedExternalUsers = removeStreamFromList(remoteUser.uid, externalUsersRef.current)
            updateExternalUsers([...cleanedExternalUsers, { uid: remoteUser.uid }])
        })
        rtcClient.on("user-left", async (remoteUser) => {
            let cleanedExternalUsers = removeStreamFromList(remoteUser.uid, externalUsersRef.current)
            updateExternalUsers([...cleanedExternalUsers])
        })
        rtcClient.on("user-published", async (remoteUser, mediaType) => {
            if (remoteUser.uid === `${userUid}screen`) {
                return
            }
            try {
                await rtcClient.subscribe(remoteUser, mediaType);
            } catch(error) {
                handleRtcError(error)
            }
            let externalUsers = [...externalUsersRef.current]
            externalUsers.forEach( user => {
                if (user.uid === remoteUser.uid) {
                    if (mediaType === 'audio') {
                        user.audioTrack = remoteUser.audioTrack
                        remoteUser.audioTrack.play()
                    } else if (mediaType === 'video') {
                        user.videoTrack = remoteUser.videoTrack
                    }
                }
            });
            dispatch(actions.setExternalTracks(externalUsers))
            updateExternalUsers(externalUsers)
        });

        rtcClient.on("user-unpublished", async (remoteUser, mediaType) => {
            try {
                await rtcClient.unsubscribe(remoteUser, mediaType);
            } catch(error) {
                handleRtcError(error)
            }            let externalUsers = [...externalUsersRef.current]
            externalUsers.forEach( user => {
                if (user.uid === remoteUser.uid) {
                    if (mediaType === 'audio') {
                        user.audioTrack = null
                    } else if (mediaType === 'video') {
                        user.videoTrack = null
                    }
                }
            });
            dispatch(actions.setExternalTracks(externalUsers))
            updateExternalUsers(externalUsers)
        });

        rtcClient.on("network-quality", function (networkStats) {
            setNetworkQuality(networkStats)
        });

        if (!isViewer) {
            rtcClient.setClientRole("host")
            try {
                await rtcClient.join( AGORA_APP_ID, roomId, agoraToken.rtcToken, userUid)
                setAgoraRtcStatus({
                    type: "INFO",
                    msg: "RTC_JOINED_CHANNEL"
                })

                setAgoraRtcStatus({
                    type: "INFO",
                    msg: "RTC_REQUESTING_MEDIA_ACCESS"
                })

                const localAudio = await AgoraRTC.createMicrophoneAudioTrack();
                const localVideo = await AgoraRTC.createCameraVideoTrack({
                    encoderConfig: "480p_9",
                });

                setAgoraRtcStatus({
                    type: "INFO",
                    msg: "RTC_PUBLISHING_STREAM"
                })
    
                localVideo.play(videoId);
                await rtcClient.setClientRole("host")
                await rtcClient.publish([localAudio, localVideo]);
                await rtcClient.enableDualStream();
                rtcClient.enableAudioVolumeIndicator()
                setAgoraRtcStatus({
                    type: "INFO",
                    msg: "RTC_STREAM_PUBLISHED"
                })
                setLocalMediaStream({
                    streamId: userUid,
                    videoTrack: localVideo,
                    audioTrack: localAudio
                });
                dispatch(actions.setRtcClient(rtcClient))
            } catch (error) {
                handleRtcError(error)
            }
        } else {
            await rtcClient.setClientRole("audience");
            try {
                const uid = await rtcClient.join( AGORA_APP_ID, roomId, agoraToken.rtcToken, userUid)

                setAgoraRtcStatus({
                    type: "INFO",
                    msg: "RTC_JOINED_CHANNEL"
                })
            } catch (error) {
                handleRtcError(error)
            }
        }
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

                dispatch(actions.setRtmChannelObj(channel))
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
                setupScreenShare()
            } else {
                if (screenShareRtcClient) {
                    if (screenShareRtcStream) {
                        unpublishScreenShareStream()
                    }
                    screenShareRtcClient.leave();
                    setScreenShareRtcClient(null)
                }
            }
        }
    }, [agoraRTC, screenSharingMode, isPlayMode, agoraScreenShareToken])

    const setupScreenShare = async () => {
        if (!screenShareRtcClient) {
            let screenShareClient = agoraRTC.createClient({
                mode: "live",
                codec: "vp8",
            });
            if (proxyMode === true) {
                screenShareClient.startProxyServer(3);
            }
            try {
                await screenShareClient.setClientRole("host")
                await screenShareClient.join(AGORA_APP_ID, roomId, agoraScreenShareToken.rtcToken, userUid + 'screen')
                publishScreenShareStream(screenShareClient)
                setScreenShareRtcClient(screenShareClient);
            } catch (error) {
                handleRtcError(error)
            }
        } else {
            publishScreenShareStream(screenShareRtcClient)
        }
    }

    const publishScreenShareStream = async (client) => {

            let screenShareVideoResolution = screenSharingMode === 'motion' ? "720p_2" : "1080p_1";

            try {
                const tracksObject = await agoraRTC.createScreenVideoTrack({
                    encoderConfig: screenShareVideoResolution
                }, "auto");

                setAgoraRtcStatus({
                    type: "INFO",
                    msg: "RTC_SCREEN_SHARE_STARTED"
                })

                const videoTrack = Array.isArray(tracksObject) ? tracksObject[0] : tracksObject
                videoTrack.play("Screen", {fit: 'contain'});
                videoTrack.on("track-ended", function (evt) {
                    setAgoraRtcStatus({
                        type: "INFO",
                        msg: "RTC_SCREEN_SHARE_STOPPED"
                    })
                });
                
                await client.publish(tracksObject);
    
            } catch (error) {
                if (error.code === "PERMISSION_DENIED") {
                    setAgoraRtcStatus({
                        type: "INFO",
                        msg: "RTC_SCREEN_SHARE_STOPPED"
                    })
                }
                else if (error.code === "SHARE_AUDIO_NOT_ALLOWED") {
                    setAgoraRtcStatus({
                        type: "WARN",
                        msg: "SHARE_AUDIO_NOT_ALLOWED"
                    })
                } else {
                    handleRtcError(error)
                }
            }
    }

    const unpublishScreenShareStream = async () => {
        try {
            await screenShareRtcClient.unpublish(screenShareRtcStream);
            if (Array.isArray(screenShareRtcStream)) {
                screenShareRtcStream.forEach( track => track.close());
            } else {
                screenShareRtcStream.close();
            }
            setScreenShareRtcStream(null);
        } catch (error) {
            handleRtcError(error)
        }
    }

    useEffect(() => {
        updateClientRole()
    }, [isPlayMode])

    const updateClientRole = async () => {
        if (isViewer && agoraRTC && rtcClient) {
            if (!isPlayMode) {
                try {
                    await rtcClient.setClientRole("host");
                    setAgoraRtcStatus({
                        type: "INFO",
                        msg: "RTC_JOINED_CHANNEL"
                    })
        
                    setAgoraRtcStatus({
                        type: "INFO",
                        msg: "RTC_REQUEST_MEDIA_ACCESS"
                    })

                    const localAudio = await agoraRTC.createMicrophoneAudioTrack();
                    const localVideo = await agoraRTC.createCameraVideoTrack({
                        encoderConfig: "480p_9",
                    });
        
                    setAgoraRtcStatus({
                        type: "INFO",
                        msg: "RTC_PUBLISH_STREAM"
                    })
        
                    localVideo.play(videoId);
                    await rtcClient.publish([localAudio, localVideo]);
                    await rtcClient.enableDualStream();
                    setAgoraRtcStatus({
                        type: "INFO",
                        msg: "RTC_STREAM_PUBLISHED"
                    })
                    setLocalMediaStream({
                        streamId: userUid,
                        videoTrack: localVideo,
                        audioTrack: localAudio
                    });
                } catch (error) {
                    handleRtcError(error)
                }
            } else {
                try {
                    await rtcClient.disableDualStream();
                    await rtcClient.unpublish([localMediaStream.audioTrack, localMediaStream.videoTrack]);
                    await rtcClient.setClientRole("audience");
                } catch(error) {
                    handleRtcError(error)
                }
            }
        }
    }

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

    const removeStreamFromList = (uid, streamList) => {
        const streamListCopy = [...streamList];
        const streamEntry = streamListCopy.find(entry => {
            return entry.uid === uid;
        });
        if (streamEntry) {
            streamListCopy.splice(streamListCopy.indexOf(streamEntry), 1);
        }
        return streamListCopy;
    }

    const handleRtcError = (err) => {
        if (err) {
            console.log("handleRtcError", err)
            setAgoraRtcStatus({
                type: "ERROR",
                error: err
            })
        }
    };

    return {
        localMediaStream,
        setLocalMediaStream,
        externalUsers,
        agoraRtcStatus,
        agoraRtmStatus,
        networkQuality,
        numberOfViewers,
    };
}