import { useState, useEffect } from 'react';
import window, { navigator, document } from 'global';
import axios from 'axios';

export default function useWebRTCAdaptor(streamerReady, isPlayMode, videoId, mediaConstraints, streamingCallbackObject, errorCallbackObject, roomId, streamId, isViewer) {

    const [webRTCAdaptor, setWebRTCAdaptor] = useState(null);
    const [streamsList, setStreamsList] = useState([]);
    const [localMediaStream, setLocalMediaStream] = useState(null);

    const [addedStream, setAddedStream] = useState(null);
    const [externalMediaStreams, setExternalMediaStreams] = useState([]);


    const [audioLevels, setAudioLevels] = useState([]);
    const [latestAudioLevel, setLatestAudioLevel] = useState(null);

    const [nsToken, setNsToken] = useState(null);

    const [client, setClient] = useState(null);
    const [agoraRTC, setAgoraRTC] = useState(null);


    var isChromium = true;

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
        if (window) {
            let AgoraRTC = require('agora-rtc-sdk');
            setAgoraRTC(AgoraRTC);
        }
    },[window])

    useEffect(() => {
        if (agoraRTC) {
            let client = agoraRTC.createClient({
                mode: "live",
                codec: "vp8",
            });
            client.init("52e732c40bf94a8c97fdd0fd443210e0");
            setClient(client);
        }
    },[agoraRTC])

    useEffect(() => {
        if (!isPlayMode) {
            if (client && document && mediaConstraints && nsToken && nsToken.iceServers && roomId && streamId && (isChromium || isViewer)) {
                client.setClientRole("host")
            }
        } else {
            if (client && document && mediaConstraints && nsToken && nsToken.iceServers && roomId) {
                
            }
        }     
    }, [client, document, nsToken, isPlayMode, roomId, streamId]);

    useEffect(() => {
        if (client && agoraRTC && streamerReady && roomId && streamId) {
            if (!isPlayMode) {
                client.join("00652e732c40bf94a8c97fdd0fd443210e0IAB32c0oM1buitu7YCOCRpaVxWR9JMlkPy902bCi4i43QAZa8+gAAAAAEADGU1aHtiy9XwEAAQC2LL1f", "testing", null, (uid)=>{
                    let localStream = agoraRTC.createStream({
                        audio: true,
                        video: true
                    });
                    localStream.setVideoProfile("480p_9");
                    localStream.init(()=>{
                        debugger;
                        localStream.play(videoId, { fit: 'contain' });
                        client.publish(localStream, handleError);
                        setLocalMediaStream(localStream);
                        // Publish the local stream
                    }, handleError);
                }, handleError);
                client.on("stream-added", function(evt){
                    client.subscribe(evt.stream, handleError);
                });
                // Play the remote stream when it is subsribed
                client.on("stream-subscribed", function(evt){
                    let stream = evt.stream;
                    let streamId = String(stream.getId());
                    setAddedStream({
                        streamId: streamId,
                        stream: stream
                    });
                });
            } 
        }
    }, [client, streamerReady, roomId, streamId]);

    useEffect(() => {
        if (latestAudioLevel) {
            updateAudioLevel(latestAudioLevel);
        }
    }, [latestAudioLevel]);

    const handleError = function(err){
        console.log("Error: ", err);
    };

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

    function updateAudioLevel(latestAudioLevel) {
        let newAudioLevels = [];
        audioLevels.forEach( level => {
            if (level.streamId !== latestAudioLevel.streamId) {
                newAudioLevels.push(level);
            }
        });
        newAudioLevels.push(latestAudioLevel);
        const cleanedUpdatedAudioLevels = newAudioLevels.filter( audioLevel => {
            return externalMediaStreams.some( stream =>  audioLevel.streamId === stream.streamId) || audioLevel.streamId === streamId;
        });
        setAudioLevels(cleanedUpdatedAudioLevels);
    }

    return { webRTCAdaptor, externalMediaStreams, localMediaStream, setAddedStream, removeStreamFromExternalMediaStreams, audioLevels };
}