import { useState, useEffect } from 'react';
import window, { navigator, document } from 'global';
import { v4 as uuidv4 } from 'uuid';
import { useAgoraToken } from './useAgoraToken';

export default function useWebRTCAdaptor(streamerReady, isPlayMode, videoId, mediaConstraints, screenSharingMode, roomId, streamId, isViewer) {

    const [webRTCAdaptor, setWebRTCAdaptor] = useState(null);
    const [streamsList, setStreamsList] = useState([]);
    const [localMediaStream, setLocalMediaStream] = useState(null);

    const [addedStream, setAddedStream] = useState(null);
    const [removedStream, setRemovedStream] = useState(null);
    const [externalMediaStreams, setExternalMediaStreams] = useState([]);

    const [agoraRTC, setAgoraRTC] = useState(null);
    const [rtcClient, setRtcClient] = useState(null);
    const [screenShareRtcClient, setScreenShareRtcClient] = useState(null);
    const [screenShareRtcStream, setScreenShareRtcStream] = useState(null);
    
    const [agoraRTM, setAgoraRTM] = useState(null);
    const [rtmClient, setRtmClient] = useState(null);
    const [rtmChannel, setRtmChannel] = useState(null);
    
    const [userUid, setUserUid] = useState(null);

    const agoraToken = useAgoraToken(roomId, userUid, !isPlayMode, true);
    const agoraScreenShareToken = useAgoraToken(roomId, userUid + 'screen', !isPlayMode, screenSharingMode);

    const [numberOfViewers, setNumberOfViewers] = useState(0);


    var isChromium = true;

    useEffect(() => {
        if (isPlayMode) {
            setUserUid(uuidv4())
        } else if (streamId) {
            setUserUid(streamId)
        }
    },[isPlayMode, streamId])

    useEffect(() => {
        if (addedStream) {
            let cleanedExternalMediaStreams = removeStreamFromList(addedStream, externalMediaStreams)
            setExternalMediaStreams([...cleanedExternalMediaStreams, addedStream]);
        }
    }, [addedStream]);

    useEffect(() => {
        if (removedStream) {
            let cleanedExternalMediaStreams = removeStreamFromList(removedStream, externalMediaStreams)
            setExternalMediaStreams([...cleanedExternalMediaStreams]);
        }
    }, [removedStream]);

    useEffect(() => {
        if (window) {
            let AgoraRTC = require('agora-rtc-sdk');
            let AgoraRTM = require('agora-rtm-sdk');
            setAgoraRTC(AgoraRTC);
            setAgoraRTM(AgoraRTM);
        }
    },[window])

    useEffect(() => {
        if (agoraRTC && userUid && streamerReady && roomId && streamId) {
            let rtcClient = agoraRTC.createClient({
                mode: "live",
                codec: "vp8",
            });
            rtcClient.init("52e732c40bf94a8c97fdd0fd443210e0");
            setRtcClient(rtcClient);
        }
    },[agoraRTC, userUid, streamerReady, roomId, streamId])

    useEffect(() => {
        if (agoraRTM) {
            let rtmClient = agoraRTM.createInstance("52e732c40bf94a8c97fdd0fd443210e0")
            setRtmClient(rtmClient);
        }
    },[agoraRTM, userUid, streamerReady, roomId, streamId])

    useEffect(() => {
        if (!isPlayMode) {
            if (agoraRTC && agoraScreenShareToken && screenSharingMode) {
                if (!screenShareRtcClient) {
                    let screenShareClient = agoraRTC.createClient({
                        mode: "live",
                        codec: "vp8",
                    });
                    screenShareClient.setClientRole('host')
                    screenShareClient.init("52e732c40bf94a8c97fdd0fd443210e0", () => {
                        screenShareClient.join(agoraScreenShareToken.rtcToken, roomId, userUid + 'screen', (uid)=>{
                            let screenShareStream = agoraRTC.createStream({
                                streamID: uid,
                                audio: false,
                                video: false,
                                screen: true,
                                screenAudio: true,
                                //optimizationMode: 'motion'
                            });
                            screenShareStream.setVideoProfile("480p_9");
                            screenShareStream.init(()=>{
                                screenShareStream.play("Screen");
                                screenShareClient.publish(screenShareStream, handleError);
                                setScreenShareRtcStream(screenShareStream);
                            }, handleError);
                        }, handleError);
                    });
                    setScreenShareRtcClient(screenShareClient);
                } else {
                    screenShareRtcClient.join(agoraScreenShareToken.rtcToken, roomId, userUid + 'screen', (uid)=>{
                        let screenShareStream = agoraRTC.createStream({
                            streamID: uid,
                            audio: true,
                            video: false,
                            screen: true
                        });
                        screenShareStream.setVideoProfile("480p_9");
                        screenShareStream.init(()=>{
                            screenShareStream.play("Screen");
                            screenShareRtcClient.publish(screenShareStream, handleError);
                            setScreenShareRtcStream(screenShareStream);
                        }, handleError);
                    }, handleError);
                }      
            } else {
                if (screenShareRtcClient && screenShareRtcStream) {
                    screenShareRtcClient.unpublish(screenShareRtcStream, handleError);
                    screenShareRtcStream.close();
                    screenShareRtcClient.leave();
                }
            }
        } 
    },[agoraRTC, screenSharingMode, isPlayMode, agoraScreenShareToken])

    useEffect(() => {
        if (!isPlayMode) {
            if (rtcClient && document && mediaConstraints && roomId && streamId && (isChromium || isViewer)) {
                rtcClient.setClientRole("host")
            }
        } else {
            if (rtcClient && document && mediaConstraints && roomId) {
                rtcClient.setClientRole("audience");
            }
        }     
    }, [rtcClient, document, isPlayMode, roomId, streamId]);

    useEffect(() => {
        if (rtcClient && rtmClient && agoraRTC && agoraToken && userUid) {
                rtcClient.join(agoraToken.rtcToken, roomId, userUid, (uid)=>{
                    if (!isPlayMode) {
                        let localStream = agoraRTC.createStream({
                            audio: true,
                            video: true
                        });
                        localStream.setVideoProfile("480p_9");
                        localStream.init(()=>{
                            localStream.play(videoId);
                            rtcClient.publish(localStream, handleError);
                            setLocalMediaStream(localStream);
                            // Publish the local stream
                        }, handleError);
                    }
                }, handleError);
                rtcClient.on("stream-added", function(evt){
                    if (evt.stream.getId() !== userUid + 'screen') {
                        rtcClient.subscribe(evt.stream, handleError);
                    }
                });
                // Play the remote stream when it is subsribed
                rtcClient.on("stream-subscribed", function(evt){
                    let stream = evt.stream;
                    let streamId = String(stream.getId());
                    setAddedStream({
                        streamId: streamId,
                        stream: stream
                    });
                });
                rtcClient.on("stream-removed", function(evt){
                    let stream = evt.stream;
                    let streamId = String(stream.getId());
                    stream.close();
                    setRemovedStream(streamId);
                });
                rtcClient.on("peer-leave", function(evt){
                    let stream = evt.stream;
                    let streamId = String(stream.getId());
                    stream.close();
                    setRemovedStream(streamId);
                });
                rtmClient.on('ConnectionStateChanged', (newState, reason) => {
                    console.log('on connection state changed to ' + newState + ' reason: ' + reason);
                });
                rtmClient.login({ token: agoraToken.rtmToken, uid: userUid }).then(() => {
                    console.log('AgoraRTM client login success');
                    const channel = rtmClient.createChannel(roomId);
                    channel.join().then(() => {
                        console.log('Joined channel');
                        setRtmChannel(channel);
                        }).catch(error => {
                        console.error(error);
                        });
                }).catch(err => {
                    console.log('AgoraRTM client login failure', err);
                });
        }
    }, [rtcClient, rtmClient, agoraToken]);

    useEffect(() => {
        if (rtmChannel) {
            let interval = setInterval(() => {
                rtmClient.getChannelMemberCount([roomId]).then( result => {
                    setNumberOfViewers(result[streamId])
                })
            }, 5000)
            return () => clearInterval(interval);
        }
    },[rtmChannel])

    function removeStreamFromList(streamId, streamList) {
        const streamListCopy = [...streamList];
        const streamEntry = streamListCopy.find( entry => {
            return entry.streamId === streamId;
        });
        if (streamEntry) {
            streamListCopy.splice(streamListCopy.indexOf(streamEntry), 1);
        }
        return streamListCopy;
    } 

    return { localMediaStream, externalMediaStreams };
}