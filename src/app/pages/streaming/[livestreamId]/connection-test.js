import {useState, useEffect} from 'react';
import {Container, Button, Grid, Header as SemanticHeader, Icon, Image, Input} from "semantic-ui-react";

import { withFirebasePage } from '../../../data/firebase';
import { WebRTCAdaptor } from '../../../static-js/webrtc_adaptor_new.js';
import axios from 'axios';
import { animateScroll } from 'react-scroll';
import ButtonWithConfirm from '../../../components/views/common/ButtonWithConfirm';

import CommentContainer from '../../../components/views/streaming/comment-container/NewCommentContainer';
import Loader from '../../../components/views/loader/Loader';
import { useRouter } from 'next/router';
import { WEBRTC_ERRORS } from '../../../data/errors/StreamingErrors';

function StreamingPage(props) {

    const router = useRouter();
    const livestreamId = router.query.livestreamId;

    const [startTest, setStartTest] = useState(false);

    const [outgoingWebRTCAdaptor, setOutgoingWebRTCAdaptor] = useState(null);
    const [incomingWebRTCAdaptor, setIncomingWebRTCAdaptor] = useState(null);

    const [isOutgoingStreamInitialized, setIsOutgoingStreamInitialized] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    
    const [isIncomingStreamInitialized, setIsIncomingStreamInitialized] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const [isCapturingDesktop, setIsCapturingDesktop] = useState(false);
    const [isLocalMicMuted, setIsLocalMicMuted] = useState(false);

    const [outgoingBitrate, setOutgoingBitrate] = useState(false);

    const [nsToken, setNsToken] = useState(null);

    useEffect(() => {
        axios({
            method: 'get',
            url: 'https://us-central1-careerfairy-e1fd9.cloudfunctions.net/getXirsysNtsToken',
        }).then( token => { 
                let tempToken = token.data.v;
                tempToken.iceServers.forEach(iceServer => {
                    iceServer.urls = iceServer.url;
                });
                setNsToken(tempToken);
            }).catch(error => {
                console.log(error);
        });
    }, []);

    useEffect(() => {
        if (startTest && nsToken && nsToken.iceServers.length > 0) {
            var pc_config = {
                'iceServers' : nsToken.iceServers
            };

            var sdpConstraints = {
                OfferToReceiveAudio : false,
                OfferToReceiveVideo : false
            };

            var mediaConstraints = {
                audio: true,
                video: {
                    width: { ideal: 1920, max: 1920 },
                    height: { ideal: 1080, max: 1080 },
                    aspectRatio: 1.77
                }
            };

            const newAdaptor = new WebRTCAdaptor({
                websocket_url : "wss://thrillin.work/WebRTCAppEE/websocket",
                mediaConstraints : mediaConstraints,
                peerconnection_config : pc_config,
                sdp_constraints : sdpConstraints,
                localVideoId : "localVideo",
                callback : function(info, obj) {
                    if (info === "initialized") {
                        setIsOutgoingStreamInitialized(true);
                        console.log("initialized");		
                    } else if (info === "publish_started") {
                        //stream is being published 
                        setTimeout(() => { setIsStreaming(true); }, 500);     
                        console.log("publish started");	
                    } else if (info === "publish_finished") {
                        //stream is finished
                        setIsStreaming(false);
                        console.log("publish finished");
                    } else if (info === "screen_share_extension_available") {
                        //screen share extension is avaiable
                        console.log("screen share extension available");
                    } else if (info === "screen_share_stopped") {
                        //"Stop Sharing" is clicked in chrome screen share dialog
                        console.log("screen share stopped");
                        setIsCapturingDesktop(false);
                    } else if (info == "closed") {
                        //console.log("Connection closed");
                        if (typeof obj != "undefined") {
                            console.log("Connecton closed: " + JSON.stringify(obj));
                        }
                    } else if (info == "refreshConnection") {
                        startStreaming();
                    } else if (info == "updated_stats") {
                        //obj is the PeerStats which has fields
                         //averageOutgoingBitrate - kbits/sec
                        //currentOutgoingBitrate - kbits/sec
                        console.log("Average outgoing bitrate " + obj.averageOutgoingBitrate + " kbits/sec"
                                + " Current outgoing bitrate: " + obj.currentOutgoingBitrate + " kbits/sec");     
                        setOutgoingBitrate(obj.currentOutgoingBitrate);
                    }
                },
                callbackError : function(error) {
                    //some of the possible errors, NotFoundError, SecurityError,PermissionDeniedError
                    const currentError = WEBRTC_ERRORS.find( webrtc_error => webrtc_error.value === error);
                    if (currentError) {
                        alert(currentError.text);
                    } else {
                        alert(error);
                    }
                }
            });
            setOutgoingWebRTCAdaptor(newAdaptor);
        }
    }, [nsToken, startTest]);

    useEffect(() => {
        if (outgoingWebRTCAdaptor && isOutgoingStreamInitialized) {
            outgoingWebRTCAdaptor.publish(livestreamId + 'test');
        }
    }, [isOutgoingStreamInitialized]);

    useEffect(() => {
        if (outgoingWebRTCAdaptor && isStreaming) {
            outgoingWebRTCAdaptor.enableStats(livestreamId + 'test');
        }
    }, [outgoingWebRTCAdaptor, isStreaming]);

    useEffect(() => {
        if (nsToken && nsToken.iceServers.length > 0 && isStreaming) {
            
            var pc_config = {
                'iceServers' : nsToken.iceServers
            };

            var sdpConstraints = {
                OfferToReceiveAudio : true,
                OfferToReceiveVideo : true
        
            };

            var mediaConstraints = {
                audio: true,
                video: {
                    width: { ideal: 1920, max: 1920 },
                    height: { ideal: 1080, max: 1080 },
                    aspectRatio: 1.77
                }
            };

            const newAdaptor = new WebRTCAdaptor({
                websocket_url : "wss://thrillin.work/WebRTCAppEE/websocket",
                mediaConstraints : mediaConstraints,
                peerconnection_config : pc_config,
                sdp_constraints : sdpConstraints,
                remoteVideoId : "remoteVideo",
                isPlayMode: true,
                callback : function(info, obj) {
                    if (info === "initialized") {
                        console.log("initialized"); 
                        setIsIncomingStreamInitialized(true);            
                    } else if (info === "play_started") {
                        //play_started
                        setIsPlaying(true);
                    } else if (info === "play_finished") {
                        // play finishedthe stream
                        setIsPlaying(false);           
                    } else if (info === "closed") {
                        //console.log("Connection closed");
                        if (typeof obj !== "undefined") {
                            console.log("Connecton closed: " + JSON.stringify(obj));
                        }
                    } else if (info === "refreshConnection") {
                        startStreaming();
                    } else if (info === "updated_stats") {
                        //obj is the PeerStats which has fields
                         //averageOutgoingBitrate - kbits/sec
                        //currentOutgoingBitrate - kbits/sec
                    }
                },
                callbackError : function(error) {
                    //some of the possible errors, NotFoundError, SecurityError,PermissionDeniedError
                    const currentError = WEBRTC_ERRORS.find( webrtc_error => webrtc_error.value === error);
                    if (currentError) {
                        alert(currentError.text);
                    } else {
                        alert(error);
                    }
                }
            });
            setIncomingWebRTCAdaptor(newAdaptor);
        }
    }, [nsToken, isStreaming]);

    useEffect(() => {
        if (incomingWebRTCAdaptor && isIncomingStreamInitialized) {
            incomingWebRTCAdaptor.play(livestreamId + 'test');
        }
    }, [isIncomingStreamInitialized]);

    function startStreaming() {
        webRTCAdaptor.publish(livestreamId + 'test');
    }

    function stopStreaming() {
        webRTCAdaptor.stop(livestreamId);
    }

    function startDesktopCapture() {
        webRTCAdaptor.switchDesktopCapture(livestreamId + 'test');
        setIsCapturingDesktop(true);
    }

    function stopDesktopCapture() {
        webRTCAdaptor.switchVideoCapture(livestreamId + 'test');
        setIsCapturingDesktop(false);
    }

    function muteLocalMic() {
        webRTCAdaptor.muteLocalMic();
        setIsLocalMicMuted(true);
    }

    function unmuteLocalMic() {
        webRTCAdaptor.unmuteLocalMic();
        setIsLocalMicMuted(false);
    }

    return (
        <div className='topLevelContainer'>
            <div className={'top-menu ' + (isStreaming ? 'active' : '')}>
                <div>
                    <h1>CareerFairy Streaming Test</h1>
                </div>
            </div>
            <Container>
                <Grid stackable>
                    <Grid.Column width={8}>
                        <div className='video-container'>
                            <video id="localVideo" autoPlay muted width="100%"></video> 
                        </div>
                        <h2>Local Webcam</h2>
                        <p>This video feed reflects the quality of the image received from your active webcam.</p>
                    </Grid.Column>
                    <Grid.Column  width={8}>
                        <div className='video-container'>
                            <video id="remoteVideo" autoPlay muted controls width="100%"></video> 
                        </div>
                        <h2>Streaming Server</h2>
                        <p>This video feed reflects the quality that your viewers will see when connecting to your stream. You should expect to see a slight delay between this image and the one on the left from your local webcam.</p>
                    </Grid.Column>
                    <Grid.Column  width={16} textAlign='center'>
                        <ul style={{ listStyleType: 'none' }}>
                            <li>Webcam & Microphone have been accessed successfully</li>
                            <li>Peer-to-peer session has been initialized successfully</li>
                            <li>Stream has been published successfully</li>
                            <li>Stream is being played successfully</li>
                        </ul>
                        <div>
                            Outgoing Bitrate: {outgoingBitrate ? outgoingBitrate : 'no info'} kb/s
                        </div>
                        <Button icon='video' content='Start Test' onClick={() => setStartTest(true)}/>
                    </Grid.Column>
                </Grid>
            </Container>
            <style jsx>{`
                .top-menu {
                    text-align: center;
                    padding: 20px;
                    margin: 0 0 30px 0;
                }

                .video-container {
                    background-color: grey;
                }


            `}</style>
        </div>
    );
}

export default StreamingPage;