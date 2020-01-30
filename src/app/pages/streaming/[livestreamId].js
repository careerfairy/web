import {useState, useEffect} from 'react';
import {Container, Button, Grid, Header as SemanticHeader, Icon, Image} from "semantic-ui-react";

import Header from '../../components/views/header/Header';
import { withFirebasePage } from '../../data/firebase';
import { WebRTCAdaptor } from '../../static-js/webrtc_adaptor.js';
import ElementTagList from '../../components/views/common/ElementTagList';
import Countdown from 'react-countdown';
import axios from 'axios';
import { useRouter } from 'next/router';
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
        <div>
            <Header color='teal'/>
            <Container className='paddingContainer' textAlign='center'>
            <SemanticHeader as='h3' textAlign='left' color='grey'>Livestream: {currentLivestream ? currentLivestream.speakerName : ''}, {currentLivestream ? currentLivestream.speakerJob : ''} @ {currentLivestream ? currentLivestream.company : ''}</SemanticHeader>
            <SemanticHeader as='h4' id='streaming-countdown' textAlign='left' color='black'>This livestream is scheduled to start in: <Countdown date={currentLivestream ? currentLivestream.start.toDate() : null} renderer={(props) => prettyPrintCountdown(props)} /></SemanticHeader>
            <Grid>
                <Grid.Row>
                    <Grid.Column width={10} textAlign='left'>
                        <video id="localVideo" autoPlay muted width="100%"></video> 
                        <div className='video-menu'>
                            <div>{ isStreaming ? 'YOU ARE NOW LIVE' : 'YOU ARE NOT LIVE CURRENTLY'}</div>
                            <ButtonWithConfirm elementId='stream-button' buttonAction={isStreaming ? stopStreaming : startStreaming} confirmDescription={isStreaming ? 'Are you sure that you want to end your livestream now?' : 'Are you sure that you want to start your livestream now?'} buttonLabel={ isStreaming ? 'Stop Streaming' : 'Start Streaming' }/>
                            <Button id='stream-button' size='big' onClick={isCapturingDesktop ? stopDesktopCapture : startDesktopCapture}>{ isCapturingDesktop ? 'Stop Sharing Screen' : 'Share Screen' }</Button>
                            <div>Number of viewers: { numberOfViewers }</div>
                            <div>
                                To use the screen sharing feature, you need to:
                                <ul>
                                    <li>use the Google Chrome browser (v34 or later) </li>
                                    <li>and install this <a target='_blank' rel="noopener noreferrer" href='https://chrome.google.com/webstore/detail/ant-media-server-screen-s/jaefaokkgpkkjijgddghhcncipkebpnb?hl=en'>Chrome Extension</a> from the Chrome Web Store</li>
                                </ul>
                            </div>
                        </div>
                        <Grid>
                            <Grid.Row>
                                <Grid.Column>
                                    <SemanticHeader as='h5' textAlign='left' color='grey'>Speaker Profile</SemanticHeader>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column width={5}>
                                    <div className='profile-label'>Company</div>
                                    <Image src={currentLivestream ? currentLivestream.companyLogoUrl : ''} size='small'/>
                                </Grid.Column>
                                <Grid.Column width={5}>
                                    <div className='profile-label'>Name</div>
                                    <div className='profile-text'>{currentLivestream ? currentLivestream.speakerName : ''}</div>
                                </Grid.Column>
                                <Grid.Column width={6}>
                                    <div className='profile-label'>Position</div>
                                    <div className='profile-text'>{currentLivestream ? currentLivestream.speakerJob : ''}</div>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column width={16}>
                                    <div className='profile-label'>Intro</div>
                                    <div className='profile-text'>{currentLivestream ? currentLivestream.description : ''}</div>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <ElementTagList fields={currentLivestream ? currentLivestream.fieldsHiring : []}/>
                            </Grid.Row>
                        </Grid>
                    </Grid.Column>
                    <Grid.Column width={6}>
                        <SemanticHeader as='h3' textAlign='left' color='grey'>Latest Questions from the Audience</SemanticHeader>
                        <div className='streamCurrentQuestionContainer'>
                            CURRENT QUESTION:
                            <div className='question'>{ currentQuestion ? currentQuestion.title : '' }</div>
                            <div className='question-upvotes'><Icon name='thumbs up outline'/> { currentQuestion ? currentQuestion.votes : '' } upvotes</div>
                            <Button icon='checkmark' content='Double Click When Done' onClick={() => markQuestionAsDone(currentQuestion)}/>
                        </div>
                        <div className='streamQuestionsContainer'>
                            { questionElements }
                        </div>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            </Container>
            <style jsx>{`
                .video-menu #stream-button {
                    margin-top: 20px;
                }

                .video-menu {
                    position: relative;
                    margin-bottom: 40px;
                }

                .video-menu div {
                    margin: 20px 0 0 0;
                }

                #button-group {
                    margin: 0 auto;
                }

                .streamCurrentQuestionContainer {
                    color: white;
                    background-color: rgb(0, 210, 170);
                    padding: 40px 50px 40px 50px;
                    font-weight: light;
                    font-size: 1.1em;
                    box-shadow: 2px 2px 5px grey;
                }

                .streamCurrentQuestionContainer .question {
                    margin: 20px;
                    line-height: 30px;
                    font-weight: bold;
                    font-size: 1.3em;
                }

                .streamCurrentQuestionContainer .question-upvotes {
                    margin: 20px;
                    font-size: 0.9em;
                    font-weight: bold;
                }

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
            `}</style>
        </div>
    );
}

StreamingPage.getInitialProps = ({ query }) => {
    return { livestreamId: query.livestreamId }
}

export default withFirebasePage(StreamingPage);