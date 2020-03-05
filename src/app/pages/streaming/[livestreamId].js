import {useState, useEffect} from 'react';
import {Button, Grid, Header as SemanticHeader, Icon, Image, Input} from "semantic-ui-react";

import { withFirebasePage } from '../../data/firebase';
import { WebRTCAdaptor } from '../../static-js/webrtc_adaptor_new.js';
import axios from 'axios';
import { animateScroll } from 'react-scroll';
import ButtonWithConfirm from '../../components/views/common/ButtonWithConfirm';

import CommentContainer from '../../components/views/streaming/comment-container/NewCommentContainer';
import Loader from '../../components/views/loader/Loader';

function StreamingPage(props) {

    const [webRTCAdaptor, setWebRTCAdaptor] = useState(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isCapturingDesktop, setIsCapturingDesktop] = useState(false);
    const [isLocalMicMuted, setIsLocalMicMuted] = useState(false);
    const [upcomingQuestions, setUpcomingQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [currentLivestream, setCurrentLivestream] = useState(null);
    const [nsToken, setNsToken] = useState(null);
    const [numberOfViewers, setNumberOfViewers] = useState(0);
    const [streamerVerified, setStreamerVerified] = useState(true);
    const [streamInitialized, setStreamInitialized] = useState(false);
    const [comments, setComments] = useState([]);
    const [allQuestionsShown, setAllQuestionsShown] = useState(false);


    useEffect(() => {
        if (props.livestreamId) {
            props.firebase.getScheduledLivestreamById(props.livestreamId).then(querySnapshot => {
                let livestream = querySnapshot.data();
                livestream.id = querySnapshot.id;
                setCurrentLivestream(livestream);
            });
        }
    }, [props.livestreamId]);

    useEffect(() => {
        if (props.livestreamId) {
            const unsubscribe = props.firebase.listenToLivestreamQuestions(props.livestreamId, querySnapshot => {
                var questionsList = [];
                querySnapshot.forEach(doc => {
                    let question = doc.data();
                    question.id = doc.id;
                    questionsList.push(question);
                });
                setUpcomingQuestions(questionsList);
            });
            return () => unsubscribe();
        }
    }, [props.livestreamId]);

    useEffect(() => {
        if (props.livestreamId && upcomingQuestions) {
            const unsubscribe = props.firebase.listenToLivestreamCurrentQuestion(props.livestreamId, querySnapshot => {
                if  (querySnapshot.size > 0) {
                    querySnapshot.forEach(doc => {
                        let question = doc.data();
                        question.id = doc.id;
                        setCurrentQuestion(question);
                    });
                }
            });
            return () => unsubscribe();
        }
    }, [props.livestreamId, upcomingQuestions]);

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
        if (currentLivestream && currentLivestream.id) {
            clearInterval();
            setInterval(() => {
                axios({
                    method: 'get',
                    url: 'https://us-central1-careerfairy-e1fd9.cloudfunctions.net/getNumberOfViewers?livestreamId=' + currentLivestream.id,
                }).then( response => { 
                        setNumberOfViewers(response.data.totalWebRTCWatchersCount > -1 ? response.data.totalWebRTCWatchersCount : 0);
                    }).catch(error => {
                        console.log(error);
                });
            }, 10000);
        }
    }, [currentLivestream]);

    useEffect(() => {
        animateScroll.scrollToBottom({
            containerId: "scrollableLeft",
            smooth: true,
            duration: 100
          });
    }, [comments]);

    function goToThisQuestion(nextQuestionId) {
        props.firebase.goToNextLivestreamQuestion(currentQuestion.id, nextQuestionId, currentLivestream.id);
    }

    function removeLivestreamQuestion(question) {
        props.firebase.removeLivestreamQuestion(currentLivestream.id, question);
    }

    let questionElements = upcomingQuestions.map((question, index) => {
        return (
            <Grid.Column width={5} key={index}>
                <div className='streamNextQuestionContainer'>
                    <p style={{ marginBottom: '5px' }}>{ question.title }</p>
                    <div className='bottom-element'>
                        <div className='streamNextQuestionNumberOfVotes'>{ question.votes } <Icon name='thumbs up'/></div>
                    </div>
                    <div>
                        <Button content='Remove' style={{ margin: '5px'}} onClick={() => removeLivestreamQuestion(question)}/>
                        <Button content='Select Question' style={{ margin: '5px'}} onClick={() => goToThisQuestion(question.id)} primary/>
                    </div>
                    <style jsx>{`
                        .streamNextQuestionContainer {
                            position: relative;
                            margin: 20px 0;
                            box-shadow: 0 0 3px grey;
                            border-radius: 10px;
                            color: rgb(50,50,50);
                            background-color: white;
                            padding: 30px 30px 50px 30px;
                            font-weight: 500;
                            font-size: 1.3em;
                            height: 100%;
                            min-height: 200px;
                            text-align: center;
                        }

                        .streamNextQuestionContainer .question-upvotes {
                            margin: 10px 0;
                            font-size: 0.9em;
                            font-weight: bold;
                        }

                        .streamNextQuestionNumberOfVotes {
                            font-weight: 600;
                            border-radius: 5px;
                            display: block;
                            color: rgb(0, 210, 170);
                            font-size: 1.3em;
                            margin-top: 10px;
                        }

                        .bottom-element {
                            position: absolute;
                            bottom: 30px;
                            left: 0;
                            right: 0;
                            width: 100%;
                            text-align: center;
                        }

                        .right-votes {
                            position: absolute;
                            right: 0;
                            top: 15px;
                            color: rgb(130,130,130);
                            font-size: 0.8em;
                        }
                    `}</style>
                </div>
            </Grid.Column>
        );
    })

    useEffect(() => {
        if (currentLivestream && !streamInitialized && nsToken && nsToken.iceServers.length > 0) {
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
                        props.firebase.setLivestreamHasStarted(true, currentLivestream.id);
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
                    //some of the possible errors, NotFoundError, SecurityError,PermissionDeniedError
                    console.log("error callback: " + error);
                    alert("There was an issue establishing the peer-2-peer connection. Please <a>contact us!</a>")
                }
            });
            setWebRTCAdaptor(newAdaptor);
        }
    }, [currentLivestream, nsToken])

    useEffect(() => {
        if (webRTCAdaptor && isStreaming) {
            webRTCAdaptor.enableStats(currentLivestream.id);
        }
    }, [webRTCAdaptor, isStreaming]);

    function startStreaming() {
        webRTCAdaptor.publish(currentLivestream.id);
    }

    function stopStreaming() {
        webRTCAdaptor.stop(currentLivestream.id);
        props.firebase.setLivestreamHasStarted(false, currentLivestream.id);
    }

    function startDesktopCapture() {
        webRTCAdaptor.switchDesktopCapture(currentLivestream.id);
        setIsCapturingDesktop(true);
    }

    function stopDesktopCapture() {
        webRTCAdaptor.switchVideoCapture(currentLivestream.id);
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

    if (!currentLivestream) {
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
                <ButtonWithConfirm color='teal' size='big' buttonAction={isStreaming ? stopStreaming : startStreaming} confirmDescription={isStreaming ? 'Are you sure that you want to end your livestream now?' : 'Are you sure that you want to start your livestream now?'} buttonLabel={ isStreaming ? 'Stop Streaming' : 'Start Streaming' }/>
                <Button circular size='big' onClick={ isCapturingDesktop ? () => stopDesktopCapture() : () => startDesktopCapture()} primary={isCapturingDesktop} icon='desktop'/>
                <Button circular size='big' onClick={ isLocalMicMuted ? () => unmuteLocalMic() : () => muteLocalMic()} primary={isLocalMicMuted} icon='microphone slash'/>
            </div>
            <div className='video-menu-left'>
                <CommentContainer livestream={ currentLivestream }/>
            </div>
            <div className={'all-questions-modal ' + (allQuestionsShown ? '' : 'hidden')}>
                <Icon name='delete' onClick={() => setAllQuestionsShown(false)} size='large' style={{ position: 'absolute', top: '10px', right: '10px', color: 'white', zIndex: '9999', cursor: 'pointer'}}/>
                <Grid centered>
                    { questionElements }
                </Grid>
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
                    left: 330px;
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
                    left: 330px;
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

StreamingPage.getInitialProps = ({ query }) => {
    return { livestreamId: query.livestreamId }
}

export default withFirebasePage(StreamingPage);