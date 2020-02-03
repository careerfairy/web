import {useState, useEffect} from 'react';
import {Container, Button, Grid, Header as SemanticHeader, Icon, Image} from "semantic-ui-react";

import Header from '../../components/views/header/Header';
import { withFirebasePage } from '../../data/firebase';
import { WebRTCAdaptor } from '../../static-js/webrtc_adaptor.js';
import ElementTagList from '../../components/views/common/ElementTagList';
import Countdown from 'react-countdown';
import axios from 'axios';
import ButtonWithConfirm from '../../components/views/common/ButtonWithConfirm';

function StreamingPage(props) {

    const [webRTCAdaptor, setWebRTCAdaptor] = useState(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isCapturingDesktop, setIsCapturingDesktop] = useState(false);
    const [upcomingQuestions, setUpcomingQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [currentLivestream, setCurrentLivestream] = useState(null);
    const [nsToken, setNsToken] = useState(null);
    const [numberOfViewers, setNumberOfViewers] = useState(0);
    const [streamerVerified, setStreamerVerified] = useState(true);
    const [streamInitialized, setStreamInitialized] = useState(false);
    const [showNextQuestions, setShowNextQuestions] = useState(true);
    const [comments, setComments] = useState([]);


    useEffect(() => {
        if (props.livestreamId) {
            props.firebase.getScheduledLivestreamById(props.livestreamId, querySnapshot => {
                let livestream = querySnapshot.data();
                livestream.id = querySnapshot.id;
                setCurrentLivestream(livestream);
            })
        }
    }, [props.livestreamId]);

    useEffect(() => {
        if (currentLivestream /* && (props.match.params.accessToken !== currentLivestream.verificationHash) */) {
            setStreamerVerified(false);
        }
    }, [currentLivestream]);

    useEffect(() => {
        updateQuestions();
    }, [props.livestreamId]);

    useEffect(() => {
        updateComments();
    }, [props.livestreamId]);

    useEffect(() => {
        if (!currentQuestion) {
            setCurrentQuestion(upcomingQuestions[0]);
        }
    }, [upcomingQuestions]);

    useEffect(() => {
        updateQuestions();
    }, [currentQuestion]);

    useEffect(() => {
        axios({
            method: 'get',
            url: 'https://us-central1-careerfairy-e1fd9.cloudfunctions.net/getXirsysNtsToken',
        }).then( token => { 
                setNsToken(token.data.v);
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
        if (webRTCAdaptor) {
            setInterval(() => {
                let connectionState = webRTCAdaptor.iceConnectionState(props.livestreamId);
                console.log(connectionState);
            }, 2000);
        }
    }, [webRTCAdaptor]);

    function updateQuestions(){
        if (props.livestreamId) {
            props.firebase.getScheduledLivestreamsUntreatedQuestions(props.livestreamId, querySnapshot => {
                var questionsList = [];
                querySnapshot.forEach(doc => {
                    let question = doc.data();
                    question.id = doc.id;
                    questionsList.push(question);
                });
                setUpcomingQuestions(questionsList);
            });
        }
    }

    function updateComments(){
        if (props.livestreamId) {
            props.firebase.getScheduledLivestreamsComments(props.livestreamId, querySnapshot => {
                var commentsList = [];
                querySnapshot.forEach(doc => {
                    let comment = doc.data();
                    comment.id = doc.id;
                    commentsList.push(comment);
                });
                setComments(commentsList);
            });
        }
    }

    function markQuestionAsDone(question) {
        props.firebase.markQuestionAsDone(currentLivestream.id, question)
            .then(() => {
                setCurrentQuestion(null)
            }, (error) => {
                console.log("Error:" + error );
            });
    }

    function removeQuestion(question) {
        props.firebase.removeQuestion(currentLivestream.id, question);
    }

    let questionElements = upcomingQuestions.map((question, index) => {
        if (!currentQuestion || question.title !== currentQuestion.title) {
            return (
                <div className='streamNextQuestionContainer' key={index}>
                    { question.title }
                    <div className='question-upvotes'><Icon name='thumbs up outline'/>{question.votes} upvotes</div>
                    <Button icon='delete' content='Remove' onClick={() => removeQuestion(question)}/>
                    <style jsx>{`
                        .streamNextQuestionContainer {
                            margin: 20px 0;
                            box-shadow: 0 0 2px rgb(160,160,160);
                            border-radius: 10px;
                            color: rgb(50,50,50);
                            background-color: white;
                            padding: 30px 50px;
                            font-weight: 500;
                            font-size: 1.3em;
                        }

                        .streamNextQuestionContainer .question-upvotes {
                            margin: 20px 0;
                            font-size: 0.9em;
                            font-weight: bold;
                        }
                    `}</style>
                </div>
            );
        } else {
            return (
                <div></div>
            );
        }
    });

    let questionElementsAlt = comments.map((comment, index) => {
        return (
            <div className='streamNextQuestionContainerAlt animated fadeInUp faster'>
                <div className='streamNextQuestionContainerTitleAlt'>
                    { comment.title }
                </div>
                <div className='streamNextQuestionContainerSubtitleAlt'>
                    <div className='question-upvotes-alt'><Icon name='thumbs up outline'/>{comment.votes}</div>
                    <div className='question-author'>@anonymous</div>
                </div>
                <style jsx>{`
                    .streamNextQuestionContainerAlt {
                        font-size: 1em;
                        color: white;
                        margin-bottom: 20px;
                        line-height: 1.8em;
                    }

                    .streamNextQuestionContainerTitleAlt {
                        font-size: 1.2em;
                        font-weight: 600;
                    }

                    .streamNextQuestionContainerSubtitleAlt div {
                        display: inline-block;
                        margin-right: 10px;
                    }
                `}</style>
            </div>
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

            setWebRTCAdaptor(new WebRTCAdaptor({
                websocket_url : "wss://thrillin.work/WebRTCAppEE/websocket",
                mediaConstraints : mediaConstraints,
                peerconnection_config : pc_config,
                sdp_constraints : sdpConstraints,
                localVideoId : "localVideo",
                callback : function(info) {
                    if (info === "initialized") {
                        setStreamInitialized(true);
                        console.log("initialized");		
                    } else if (info === "publish_started") {
                        //stream is being published 
                        props.firebase.setScheduledLivestreamHasStarted(true, currentLivestream.id);
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
                    }
                },
                callbackError : function(error) {
                    //some of the possible errors, NotFoundError, SecurityError,PermissionDeniedError
                    if (error === STREAM_ERROR.SCREEN_SHARE_ACCESS_DENIED) {
                        setIsCapturingDesktop(false);
                        return;
                    }
                    console.log("error callback: " + error);
                    alert("An unexpected error occured.");
                }
            }));
        }
    }, [currentLivestream, nsToken])

    function startStreaming() {
        webRTCAdaptor.publish(currentLivestream.id);
    }

    function stopStreaming() {
        webRTCAdaptor.stop(currentLivestream.id);
        props.firebase.setScheduledLivestreamHasStarted(false, currentLivestream.id);
    }

    function startDesktopCapture() {
        webRTCAdaptor.switchDesktopCapture(currentLivestream.id);
        setIsCapturingDesktop(true);
    }

    function stopDesktopCapture() {
        webRTCAdaptor.switchVideoCapture(currentLivestream.id);
        setIsCapturingDesktop(false);
    }

    function prettyPrintCountdown(props) {
        return props.days + (props.days === 1 ? ' day ' : ' days ')
        + props.hours + (props.hours === 1 ? ' hour ' : ' hours ') 
        + props.minutes + (props.minutes === 1 ? ' minute ' : ' minutes ')
        + props.seconds + (props.seconds === 1 ? ' second ' : ' seconds ');
    }

    /* if (streamerVerified === false) {
        return(
            <Redirect to='/'/>
        );
    } */

    return (
        <div className='topLevelContainer'>
            <div className={'top-menu ' + (isStreaming ? 'active' : '')}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                    <h3 style={{ color: (isStreaming ?  'white' : 'orange') }}>{ isStreaming ? 'YOU ARE NOW LIVE' : 'YOU ARE NOT LIVE'}</h3>
                    { isStreaming ? '' : 'Press Start Streaming to begin'}
                </div>
                <div style={{ float: 'right', display: 'inlineBlock', margin: '0 20px' }}>
                    <Button size='big' onClick={() => setShowNextQuestions(!showNextQuestions)}>{ showNextQuestions ? 'Hide Questions' : 'Show Questions'}</Button>
                </div>
            </div>
            <div className='streamingContainer'>
                <video id="localVideo" autoPlay muted width="100%"></video> 
            </div>
            <div className='video-menu'>
                    <ButtonWithConfirm color='teal' size='huge' buttonAction={isStreaming ? stopStreaming : startStreaming} confirmDescription={isStreaming ? 'Are you sure that you want to end your livestream now?' : 'Are you sure that you want to start your livestream now?'} buttonLabel={ isStreaming ? 'Stop Streaming' : 'Start Streaming' }/>
                    {/* <Button size='huge' onClick={isCapturingDesktop ? stopDesktopCapture : startDesktopCapture}>{ isCapturingDesktop ? 'Stop Sharing Screen' : 'Share Screen' }</Button> */}
                    <Button size='huge' onClick={() => {}} disabled={!isStreaming}>Interact!</Button>
                    <div className='video-menu-poll-buttons'>
                        <Icon color='teal' style={{ marginRight: '15px', fontSize: '2.5em' }} name='thumbs up' size='big'/>
                        <Icon color='teal' style={{ fontSize: '2.5em' }}name='heart' size='big'/>
                    </div>
            </div>
            <div className='video-menu-right'>
                <div className={'video-menu-right-content ' + (showNextQuestions ? 'animated slideInRight fast' : 'animated slideOutRight fast')}>
                    <div className='streamCurrentQuestionContainer'>
                        <div className='content'>
                            CURRENT QUESTION:
                            <div className='question'>{ currentQuestion ? currentQuestion.title : '' }</div>
                            <div className='question-upvotes'><Icon name='thumbs up outline'/> { currentQuestion ? currentQuestion.votes : '' } Upvotes</div>
                            <Button size='large' disabled={!isStreaming}>Press when Done</Button>
                        </div>
                    </div>
                    <div className='video-menu-questions-wrapper' style={{ display: 'none' }}>
                        <div className='video-menu-questions'>
                            { questionElements }
                        </div>
                    </div>
                </div>
            </div>
            <div className='video-menu-left'>
                <div className='video-menu-left-content'>
                    { questionElementsAlt }
                </div>
            </div>
            <div className='questions-side-layout'>
                
            </div>
            <style jsx>{`

                .topLevelContainer {
                    position: absolute;
                    height:100%;
                    width: 100%;
                }

                .top-menu {
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
                    padding: 25px 0;
                    z-index: 1000;
                    text-align: center;
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

                .streamingContainer {
                    position: absolute;
                    top: 75px;
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
                    overflow: scroll;
                    overflow-x: hidden;    
                    width: 330px;
                    z-index: 1;
                    background: rgb(2,0,36);
                    background: linear-gradient(270deg, rgba(2,0,36,1) 0%, rgba(84,84,84,0) 0%, rgba(0,0,0,0.8687850140056023) 100%);
                    -ms-overflow-style: none;
                }

                .video-menu-left::-webkit-scrollbar {
                    display: none;
                }

                .video-menu-left-content {
                    position: absolute;
                    top: 0;
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
                    right: 40px;
                    bottom: 40px;
                }
            `}</style>
        </div>
    );
}

StreamingPage.getInitialProps = ({ query }) => {
    return { livestreamId: query.livestreamId }
}

export default withFirebasePage(StreamingPage);