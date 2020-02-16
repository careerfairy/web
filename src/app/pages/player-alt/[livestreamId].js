import React, {useState, useEffect,Fragment} from 'react';
import {Container, Button, Grid, Icon, Header as SemanticHeader, Input, Image} from "semantic-ui-react";

import Header from '../../components/views/header/Header';
import Loader from '../../components/views/loader/Loader';
import { withFirebasePage } from '../../data/firebase';
import { WebRTCAdaptor } from '../../static-js/webrtc_adaptor_new.js';
import DateUtil from '../../util/DateUtil';
import { useRouter } from 'next/router';
import Footer from '../../components/views/footer/Footer';
import axios from 'axios';
import PlayerPrepare from '../../components/views/player-prepare/PlayerPrepare';

function StreamPlayer(props) {

    const router = useRouter();
    const eth_logo = 'https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Feth-career-center.png?alt=media&token=9403f77b-3cb6-496c-a96d-62be1496ae85';

    const [webRTCAdaptor, setWebRTCAdaptor] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isInitialized, setInitialized] = useState(false);

    const [upcomingQuestions, setUpcomingQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [newQuestionTitle, setNewQuestionTitle] = useState("");
    const [newCommentTitle, setNewCommentTitle] = useState("");
    const [currentLivestream, setCurrentLivestream] = useState(null);
    const [madeAClick, setMadeAClick] = useState(false);
    const [comments, setComments] = useState([]);
    const [nsToken, setNsToken] = useState(null);


    useEffect(() => {
        if (props.livestreamId) {
            props.firebase.listenToScheduledLivestreamById(props.livestreamId, querySnapshot => {
                let livestream = querySnapshot.data();
                livestream.id = querySnapshot.id;
                setCurrentLivestream(livestream);
            })
        }
    }, [props.livestreamId]);

    useEffect(() => {
        if (props.livestreamId) {
            props.firebase.listenToScheduledLivestreamsQuestions(props.livestreamId, querySnapshot => {
                var questionsList = [];
                querySnapshot.forEach(doc => {
                    let question = doc.data();
                    question.id = doc.id;
                    questionsList.push(question);
                });
                setUpcomingQuestions(questionsList);
            });
        }
    }, [props.livestreamId]);

    useEffect(() => {
        if (props.livestreamId) {
            props.firebase.listenToScheduledLivestreamsComments(props.livestreamId, querySnapshot => {
                var commentsList = [];
                querySnapshot.forEach(doc => {
                    let comment = doc.data();
                    comment.id = doc.id;
                    commentsList.push(comment);
                });
                setComments(commentsList);
            });
        }
    }, [props.livestreamId]);

    useEffect(() => {
        if (!currentQuestion) {
            setCurrentQuestion(upcomingQuestions[0]);
        }
    }, [upcomingQuestions]);

    useEffect(() => {
        if (isInitialized && currentLivestream && currentLivestream.hasStarted) {
            setTimeout(() => {
                startPlaying();
            }, 3000);
        }
    }, [currentLivestream, isInitialized]);

    useEffect(() => {
        setCurrentQuestion(upcomingQuestions[0]);
    }, [upcomingQuestions]);

    function upvoteQuestion(question) {
        props.firebase.upvoteQuestion(currentLivestream.id, question);
    }

    let questionElements = upcomingQuestions.map((question, index) => {
        if (!currentQuestion || question.title !== currentQuestion.title) {
            return (
                    <div className='streamNextQuestionContainer'>
                        <p>{ question.title }</p>
                        <div className='streamNextQuestionNumberOfVotes'>{ question.votes } <Icon name='thumbs up' color='teal'/></div>
                        <Button id='scheduled-question-thumbs-up' color='teal' icon='thumbs up' onClick={() => upvoteQuestion(question)} content={'UPVOTE'}/>
                    </div>
            );
        } else {
            return (
                <div></div>
            );
        }
    })

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
        if (nsToken && nsToken.iceServers.length > 0) {
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
                callback : function(info) {
                    if (info === "initialized") {
                        console.log("initialized"); 
                        setInitialized(true);            
                    } else if (info === "play_started") {
                        //play_started
                        setIsPlaying(true);
                    } else if (info === "play_finished") {
                        // play finishedthe stream
                        setIsPlaying(false);           
                    }
                },
                callbackError : function(error) {
                    //some of the possible errors, NotFoundError, SecurityError,PermissionDeniedError
                    console.log("error callback: " + error);
                    alert("An unexpected error occured while starting this livestream. Please reload this page and try again.");
                }
            });
            setWebRTCAdaptor(newAdaptor);
        }
    }, [nsToken])

    function startPlaying() {
        webRTCAdaptor.play(currentLivestream.id);
    }

    function prettyPrintCountdown(props) {
        return props.days + (props.days === 1 ? ' day ' : ' days ')
        + props.hours + (props.hours === 1 ? ' hour ' : ' hours ') 
        + props.minutes + (props.minutes === 1 ? ' minute ' : ' minutes ')
        + props.seconds + (props.seconds === 1 ? ' second ' : ' seconds ');
    }

    function addNewQuestion() {
        const newQuestion = {
            title: newQuestionTitle,
            votes: 0,
            type: "new"
        }
        props.firebase.putScheduledLivestreamsQuestion(currentLivestream.id, newQuestion)
            .then(() => {
                setNewQuestionTitle("");
            }, () => {
                console.log("Error");
            })
    }

    function addNewComment(comment) {
        const newComment = {
            title: newCommentTitle,
            votes: 0,
        }
        props.firebase.putScheduledLivestreamsComment(currentLivestream.id, newComment)
            .then(() => {
                setNewCommentTitle("");
            }, error => {
                console.log("Error: " + error);
            })
    }

    if (!currentLivestream) {
        return <Loader/>;
    }

    let CurrentQuestionElement = () => {
        return (
            <div>
                <div className='currentQuestionContainer'>
                    <div className='question-label'>Current Question</div>
                    <div className='question-title'>
                        { currentQuestion ? currentQuestion.title : '' }
                    </div>
                </div>
                <style jsx>{`
                    .currentQuestionContainer {
                        position: relative;
                        height: 160px;
                        width: 100%;
                        background-color: rgba(0, 210, 170, 0.7);
                        padding-top: 5px;
                    }

                    .currentQuestionContainer .question-label {
                        text-transform: uppercase;
                        text-align: center;
                        font-size: 0.9em;
                        font-weight: 700;
                        color: rgba(255,255,255,0.7);
                    }


                    .currentQuestionContainer .question-title {
                        width: 100%;
                        text-align: center;
                        font-size: 1.2em;
                        font-weight: 700;
                        color: white;
                        padding: 15px;
                    }

                    .currentQuestionContainer .question-buttons {
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        text-align: center;
                        padding: 15px 0;
                    }
                `}</style>
            </div>
        );
    }

    let questionElementsAlt = comments.map((comment, index) => {
        return (
            <div className='streamNextQuestionContainerAlt animated fadeInUp faster'>
                <div className='streamNextQuestionContainerTitleAlt'>
                    { comment.title }
                </div>
                <div className='streamNextQuestionContainerSubtitleAlt'>
                    <div className='question-upvotes-alt'><Icon name='thumbs up outline'/>{comment.votes}</div>
                    <div className='question-author'>@{comment.author}</div>
                </div>
                <style jsx>{`
                    .streamNextQuestionContainerAlt {
                        font-size: 1em;
                        margin-bottom: 25px;
                        line-height: 1.4em;
                    }

                    .streamNextQuestionContainerTitleAlt {
                        font-size: 1em;
                        font-weight: 700;
                        margin-bottom: 5px;
                    }

                    .streamNextQuestionContainerSubtitleAlt div {
                        display: inline-block;
                        margin-right: 10px;
                        color: rgb(180,180,180);
                    }
                `}</style>
            </div>
        );
    })

   /*  if (!currentLivestream.hasStarted) {
        router.replace('/upcoming-livestream/' + currentLivestream.id);
    } */

    return (
        <div className='topLevelContainer'>
            {/* <PlayerPrepare madeAClick={madeAClick} isPlaying={isPlaying} currentLivestream={currentLivestream} setMadeAClick={() => setMadeAClick(true)} upcomingQuestions={upcomingQuestions}/> */}
            <div className='top-menu'>
                <div style={{ position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)'}}>
                    <Image src='/logo_teal.png' style={{ maxHeight: '50px', maxWidth: '150px', display: 'inline-block', marginRight: '2px'}}/>
                    <Image src={ eth_logo } style={{ postion: 'relative', zIndex: '100', maxHeight: '50px', maxWidth: '150px', display: 'inline-block'}}/>
                    <div style={{ position: 'absolute', bottom: '13px', left: '120px', fontSize: '7em', fontWeight: '700', color: 'rgba(0, 210, 170, 0.2)', zIndex: '50'}}>&</div>
                </div>
            </div>
            <div className='streamingOuterContainer'>
                <div className='streamingContainer'>
                    <video id="remoteVideo" autoPlay controls width='100%' ></video> 
                </div>
            </div>
            <div className='video-menu'>
                <Button  icon='heart' size='huge' color='pink' circular/>
                <Button  icon='thumbs down' size='huge' circular/>
            </div>
            <div className='video-menu-left'>
                <CurrentQuestionElement/>
                <div>
                    <div className='video-menu-left-reactions'>
                        <div style={{ margin: '0 0 5px 0'}}>REACTIONS TO ANSWER</div>
                        <Grid centered>
                            <Grid.Column width={5} textAlign='center'>
                                <Icon name='heart' color='pink' size='large' style={{ margin: '0 10px 0 0' }}/>
                                <span style={{ color: 'rgb(255, 20, 147)', fontSize: '1.3em' }}>12</span>
                            </Grid.Column>
                            <Grid.Column width={5} textAlign='center'>
                                <Icon name='thumbs down' color='grey' size='large' style={{ margin: '0 10px 0 0' }}/>
                                <span style={{ color: 'rgb(160,160,160)', fontSize: '1.3em' }}>4</span>
                            </Grid.Column>
                        </Grid>
                    </div>
                    <div className='video-menu-left-outer-content'>
                        <div className='video-menu-left-content'>
                            { questionElementsAlt }
                        </div>
                    </div>
                    <div className='video-menu-left-input'>
                        <Input action='Send' fluid placeholder='Send a reaction...' />
                    </div>
                </div>
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
                    height: 80px;
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

                #remoteVideo {
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

                .video-menu-left-reactions {
                    width: 100%;
                    height: 60px;
                    text-align: center;
                    padding: 5px;
                    font-size: 0.8em;
                    font-weight: 700;
                    color: rgba(0, 210, 170, 0.7);
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
          `}</style>
        </div>
    );
}

StreamPlayer.getInitialProps = ({ query }) => {
    return { livestreamId: query.livestreamId }
}

export default withFirebasePage(StreamPlayer);