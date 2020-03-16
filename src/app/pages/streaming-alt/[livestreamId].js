import {useState, useEffect} from 'react';
import {Button, Grid, Header as SemanticHeader, Icon, Image, Input} from "semantic-ui-react";

import { withFirebasePage } from '../../data/firebase';
import FireStoreParser from 'firestore-parser';
import { WebRTCAdaptor } from '../../static-js/webrtc_adaptor.js';
import axios from 'axios';
import ButtonWithConfirm from '../../components/views/common/ButtonWithConfirm';

import CommentContainer from '../../components/views/streaming-alt/comment-container/NewCommentContainer';
import Loader from '../../components/views/loader/Loader';
import { useRouter } from 'next/router';
import { WEBRTC_ERRORS } from '../../data/errors/StreamingErrors';
import FirebaseRest from '../../data/firebase/FirebaseRest';

function StreamingPage(props) {

    const router = useRouter();
    const livestreamId = router.query.livestreamId;
    const streamToken = router.query.streamToken;

    const [webRTCAdaptor, setWebRTCAdaptor] = useState(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isCapturingDesktop, setIsCapturingDesktop] = useState(false);
    const [isLocalMicMuted, setIsLocalMicMuted] = useState(false);
    const [currentLivestream, setCurrentLivestream] = useState(null);
    const [nsToken, setNsToken] = useState(null);
    const [numberOfViewers, setNumberOfViewers] = useState(0);
    const [streamerVerified, setStreamerVerified] = useState(false);
    const [streamInitialized, setStreamInitialized] = useState(false);

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
        if (true) {
            clearInterval();
            setInterval(() => {
                axios({
                    method: 'get',
                    url: 'https://us-central1-careerfairy-e1fd9.cloudfunctions.net/getNumberOfViewers?livestreamId=' + livestreamId,
                }).then( response => { 
                        setNumberOfViewers(response.data.totalWebRTCWatchersCount > -1 ? response.data.totalWebRTCWatchersCount : 0);
                    }).catch(error => {
                        console.log(error);
                });
            }, 10000);
        }
    }, [livestreamId]);

    useEffect(() => {
        if (!streamInitialized && nsToken && nsToken.iceServers.length > 0) {
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
                        setStreamInitialized(true);
                        console.log("initialized");		
                    } else if (info === "publish_started") {
                        //stream is being published 
                        setIsStreaming(true);
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
                         
                    }
                },
                callbackError : function(error) {
                    debugger;
                    //some of the possible errors, NotFoundError, SecurityError,PermissionDeniedError
                    const currentError = WEBRTC_ERRORS.find( webrtc_error => webrtc_error.value === error);
                    if (currentError) {
                        alert(currentError.text);
                    } else {
                        alert(error);
                    }
                }
            });
            setWebRTCAdaptor(newAdaptor);
        }
    }, [livestreamId, nsToken, streamerVerified])

    useEffect(() => {
        if (webRTCAdaptor && isStreaming) {
            webRTCAdaptor.enableStats(livestreamId);
        }
    }, [webRTCAdaptor, isStreaming]);

    function startStreaming() {
        webRTCAdaptor.publish(livestreamId);
    }

    function stopStreaming() {
        webRTCAdaptor.stop(livestreamId);
    }

    function startDesktopCapture() {
        webRTCAdaptor.switchDesktopCaptureWithCamera(livestreamId);
        setIsCapturingDesktop(true);
    }

    function stopDesktopCapture() {
        webRTCAdaptor.switchVideoCapture(livestreamId);
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

    if (false) {
        return <Loader/>;
    }

    return (
        <div className='topLevelContainer'>
            <div className={'top-menu ' + (isStreaming ? 'active' : '')}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                    <h3 style={{ color: (isStreaming ?  'white' : 'orange') }}>{ isStreaming ? 'YOU ARE NOW LIVE' : 'YOU ARE NOT LIVE'}</h3>
                    { isStreaming ? '' : 'Press Start Streaming to begin'}
                </div>
                <div style={{ float: 'right', display: 'inlineBlock', margin: '0 20px', fontSize: '1.2em', fontWeight: '700', padding: '10px' }}>
                    Viewers: { numberOfViewers }
                </div>
            </div>
            <div className='streamingOuterContainer'>
                <div className='streamingContainer'>
                    <video id="localVideo" autoPlay muted width="100%"></video> 
                </div>
            </div>
            <div className='video-menu'>
                <ButtonWithConfirm color='teal' size='big' buttonAction={isStreaming ? stopStreaming : startStreaming} confirmDescription={isStreaming ? 'Are you sure that you want to end your livestream now?' : 'Are you sure that you want to start your livestream now?'} buttonLabel={ isStreaming ? 'Stop Streaming' : 'Start Streaming' } disabled={!streamInitialized}/>
                <Button circular size='big' onClick={ isCapturingDesktop ? () => stopDesktopCapture() : () => startDesktopCapture()} primary={isCapturingDesktop} icon='desktop'/>
                <Button circular size='big' onClick={ isLocalMicMuted ? () => unmuteLocalMic() : () => muteLocalMic()} primary={isLocalMicMuted} icon='microphone slash'/>
            </div>
            <style jsx>{`
                .hidden {
                    display: none;
                }

                .topLevelContainer {
                    position: absolute;
                    height:100%;
                    width: 100%;
                }

                .top-menu {
                    position: relative;
                    background-color: rgba(245,245,245,1);
                    padding: 15px 0;
                    height: 75px;
                    text-align: center;
                    position: relative;
                }

                .top-menu div, .top-menu button {
                    display: inline-block;
                    vertical-align: middle;
                }

                .top-menu #stream-button {
                    margin: 0 50px;
                }

                .top-menu.active {
                    background-color: rgba(0, 210, 170, 1);
                    color: white;
                }

                .top-menu h3 {
                    font-weight: 600;
                }

                .video-menu {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 15px 0;
                    z-index: 1000;
                    text-align: center;
                    background-color: rgb(240,240,240);
                }

                .questions-side-layout {
                    position: absolute;
                    right: 20px;
                    top: 80px;
                    width: 20%;
                    height: 80%;
                    min-width: 200px;
                }

                #button-group {
                    margin: 0 auto;
                }

                .streamingOuterContainer {
                    position: absolute;
                    top: 75px;
                    bottom: 80px;
                    left: 0;
                    right: 0;
                }

                .streamingContainer {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    min-width: 100%;
                    max-height: 100%;
                    height: auto;
                    width: auto;
                    background-color: black;
                    z-index: -2000;
                    cursor: pointer;
                }

                #localVideo {
                    position: absolute;
                    width: 100%;
                    max-height: 100%;
                    height: auto;

                    top: 50%;
                    left: 50%;
                    transform: translate(-50%,-50%);
                    z-index: -1000;
                    background-color: black;
                }

                .streamCurrentQuestionContainer {
                    color: white;
                    background-color: rgba(0, 210, 170, 0.95);
                    font-size: 1em;
                    box-shadow: 0 0 2px rgb(160,160,160);
                    border-radius: 5px;
                    text-align: center;
                    width: 100%;
                }

                .streamCurrentQuestionContainerRight {
                    text-align: right;
                }

                .streamCurrentQuestionContainer .content {
                    padding: 15px 20px 15px 20px;
                }

                .streamCurrentQuestionContainer .question {
                    line-height: 20px;
                    font-weight: bold;
                    font-size: 1.2em;
                    margin: 25px 0;
                }

                .streamCurrentQuestionContainer .question-upvotes {
                    margin: 10px 0 10px 0;
                    font-size: 0.9em;
                    font-weight: bold;
                }

                .video-menu-left {
                    position: absolute;
                    top: 75px;
                    left: 0;
                    bottom: 0;
                    width: 330px;
                    z-index: 1;
                }

                .video-menu-left-outer-content::-webkit-scrollbar {
                    width: 5px;
                    background-color: white;
                }

                .video-menu-left-outer-content {
                    position: absolute;
                    top: 220px;
                    left: 0;
                    bottom: 40px;
                    width: 100%;
                    overflow: scroll;
                    overflow-x: hidden;    
                    z-index: 3;
                    box-shadow: inset 0 0 5px grey;
                }

                .no-comment-message {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    color: rgb(255, 20, 147);
                }

                .video-menu-left-input {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 40px;
                    width: 100%;
                }

                .video-menu-left-content {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 100%;
                    padding: 10px 20px;
                }

                .video-menu-right {
                    position: absolute;
                    top: 75px;
                    right: 10px;
                    bottom: 60px;
                    overflow: hidden;
                    width: 330px;
                    padding: 10px 0;
                    z-index: 1;
                    padding: 10px 0;
                }

                .video-menu-right-content {
                    position: absolute;
                    top: 10px;
                    bottom: 0;
                    width: 100%;
                }

                .video-menu-bottom {
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    height: 100px;
                    z-index: 9999;
                }

                .video-menu-questions-wrapper {
                    position: absolute;
                    top: 220px;
                    bottom: 0;
                    width: auto;
                    overflow: scroll;
                    overflow-x: hidden;
                    z-index: 9000;
                    width: 100%;
                }

                .video-menu-questions-wrapper::-webkit-scrollbar {
                    width: 0px;  /* Remove scrollbar space */
                    background: transparent;  /* Optional: just make scrollbar invisible */
                }

                .video-menu-questions {
                    width: 100%;
                }

                .video-menu-questions-bottom-hint {
                    position: absolute;
                    bottom: 0;
                    color: white;
                    background-color: rgba(0, 210, 170, 0.95);
                    width: 100%;
                    text-align: center;
                    padding: 10px 0;
                    z-index: 1000;
                }

                .video-menu-questions-top-hint {
                    position: absolute;
                    top: 0;
                    color: white;
                    background-color: rgba(0, 210, 170, 0.95);
                    width: 100%;
                    text-align: center;
                    padding: 10px 0;
                    z-index: 1000;
                }

                .currentQuestionContainer {
                    height: 200px;
                    width: 100%;
                    background-color: rgb(0, 210, 170);
                }

                .streamNextQuestionContainer {
                    margin: 0 0 10px 0;
                    box-shadow: 0 0 2px rgb(160,160,160);
                    border-radius: 10px;
                    color: rgb(50,50,50);
                    background-color: rgba(255,255,255,0.95);
                    padding: 20px 10px 20px 10px;
                    font-weight: 500;
                    font-size: 1.1em;
                    height: 100%;
                    width: 100%;
                    white-space: pre-wrap;
                    text-align: center;
                }

                .streamNextQuestionContainerTitle {
                    margin: 0 0 20px 0;
                }

                .streamNextQuestionContainer .question-upvotes {
                    margin: 20px 0;
                    font-size: 0.9em;
                    font-weight: bold;
                }

                .profile-text {
                    font-size: 1.15em;
                    font-weight: 500;
                }

                .profile-text.large {
                    font-size: 1.4em;
                    font-weight: 500;
                    margin-top: 20px;
                }

                .profile-label {
                    font-size: 0.8em;
                    color: grey;
                }

                #streaming-countdown {
                    font-weight: 300;
                }

                #stream-button {
                    display: inline-block;
                    float: left;
                }

                .video-menu-poll-buttons {
                    position: absolute;
                    right: 20px;
                    bottom: 25px;
                }

                .all-questions-modal {
                    position: absolute;
                    top: 75px;
                    left: 330px;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0,0,0, 0.8);
                    z-index: 9000;
                    overflow-y: scroll;
                    overflow-x: hidden;
                    padding: 30px 0;
                }

                .all-questions-modal::-webkit-scrollbar-thumb {
                    background-color: rgb(0, 210, 170);
                }
            `}</style>
        </div>
    );
}

export default withFirebasePage(StreamingPage);