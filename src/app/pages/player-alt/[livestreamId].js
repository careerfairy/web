import React, {useState, useEffect} from 'react';
import {Button, Grid, Icon, Image, Input} from "semantic-ui-react";

import Loader from '../../components/views/loader/Loader';
import { withFirebasePage } from '../../data/firebase';
import { WebRTCAdaptor } from '../../static-js/webrtc_adaptor_new.js';
import { useRouter } from 'next/router';
import axios from 'axios';
import { animateScroll } from 'react-scroll';

function StreamPlayer(props) {

    const router = useRouter();
    const eth_logo = 'https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Feth-career-center.png?alt=media&token=9403f77b-3cb6-496c-a96d-62be1496ae85';

    const [user, setUser] = useState(null);
    const [webRTCAdaptor, setWebRTCAdaptor] = useState(null);
    const [nsToken, setNsToken] = useState(null);

    const [isInitialized, setInitialized] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    
    const [allQuestionsShown, setAllQuestionsShown] = useState(false);
    const [upcomingQuestions, setUpcomingQuestions] = useState([]);
    const [voteOnQuestions, setVoteOnQuestions] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [newQuestionTitle, setNewQuestionTitle] = useState("");
    const [newCommentTitle, setNewCommentTitle] = useState("");
    const [currentLivestream, setCurrentLivestream] = useState(null);
    const [comments, setComments] = useState([]);

    useEffect(() => {
        props.firebase.auth.onAuthStateChanged(user => {
            if (user !== null) {
                setUser(user);
            } else {
                router.replace('/login');
            }
        })
    }, []);

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
        if (user && upcomingQuestions && upcomingQuestions.length > 0) {
            let questionsToBeVoted = upcomingQuestions.filter(question => {
                if (question.emailOfVoters) {
                    return question.emailOfVoters.indexOf(user.email) === -1;
                } else {
                    return true;
                }
            });
            setVoteOnQuestions(questionsToBeVoted[0]);
        }
    }, [upcomingQuestions]);

    useEffect(() => {
        if (props.livestreamId && currentQuestion) {
            props.firebase.listenToScheduledLivestreamQuestionComments(props.livestreamId, currentQuestion.id, querySnapshot => {
                var commentsList = [];
                querySnapshot.forEach(doc => {
                    let comment = doc.data();
                    comment.id = doc.id;
                    commentsList.push(comment);
                });
                setComments(commentsList);
            });
        }
    }, [props.livestreamId, currentQuestion]);

    useEffect(() => {
        animateScroll.scrollToBottom({
            containerId: "scrollableLeft",
            smooth: true,
            duration: 100
          });
          console.log("supposed to have scrolled");
    }, [comments]);

    useEffect(() => {
        if (!currentQuestion) {
            setCurrentQuestion(upcomingQuestions[0]);
        }
    }, [upcomingQuestions]);

    useEffect(() => {
        if (isInitialized && currentLivestream && currentLivestream.hasStarted && !isPlaying) {
            setTimeout(() => {
                startPlaying();
            }, 2000);
        }
    }, [currentLivestream, isInitialized]);

    function upvoteQuestion(question) {
        props.firebase.upvoteQuestion(currentLivestream.id, question, user.email);
    }

    let questionElements = upcomingQuestions.map((question, index) => {
        return (
            <Grid.Column width={5}>
                <div className='streamNextQuestionContainer' key={index}>
                    <p style={{ marginBottom: '5px' }}>{ question.title }</p>
                    <p style={{ fontSize: '0.8em', fontWeight: '300', color: 'rgb(200,200,200)' }}>from @Martin.Kamm</p>
                    <div className='bottom-element'>
                        <Button icon='thumbs down' size='massive' circular/>
                        <Button icon='thumbs up' onClick={() => upvoteQuestion(question)} size='massive' circular primary/>
                        <div className='streamNextQuestionNumberOfVotes'>{ question.votes } <Icon name='thumbs up'/></div>
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
                            font-size: 1.3em;
                            border-radius: 5px;
                            display: block;
                            color: rgb(210,210,210);
                            font-size: 0.8em;
                            margin-top: 10px;
                        }

                        .bottom-element {
                            position: absolute;
                            bottom: 15px;
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
        if (nsToken && nsToken.iceServers.length > 0 && !isPlaying) {
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
    }, [nsToken, currentLivestream])

    function startPlaying() {
        webRTCAdaptor.play(currentLivestream.id);
    }

    function addNewQuestion() {
        const newQuestion = {
            title: newQuestionTitle,
            votes: 0,
            type: "new",
            author: user.email
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
        props.firebase.putScheduledLivestreamQuestionComment(currentLivestream.id, currentQuestion.id, newComment)
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
                    <div className='question-buttons'>
                        <Button content={ allQuestionsShown ? 'Hide All Questions' : 'See All Questions' } size='small' onClick={() => setAllQuestionsShown(true)} primary/>
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

    let commentsElements = comments.map((comment, index) => {
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
            <div className='top-menu'>
                <div style={{ position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)'}}>
                    <Image src='/logo_teal.png' style={{ maxHeight: '50px', maxWidth: '150px', display: 'inline-block', marginRight: '2px'}}/>
                    <Image src={ eth_logo } style={{ postion: 'relative', zIndex: '100', maxHeight: '50px', maxWidth: '150px', display: 'inline-block'}}/>
                    <div style={{ position: 'absolute', bottom: '13px', left: '120px', fontSize: '7em', fontWeight: '700', color: 'rgba(0, 210, 170, 0.2)', zIndex: '50'}}>&</div>
                </div>
            </div>
            <div className='streamingOuterContainer'>
                <div className='streamingContainer'>
                    <video id="remoteVideo" autoPlay controls width='100%'></video> 
                </div>
                <div className={'newQuestionPopup animated slideInUp ' + (voteOnQuestions ? '' : 'hidden')}>
                    <div className='streamNextQuestionContainer'>
                        <p style={{ marginBottom: '5px' }}>{voteOnQuestions ? voteOnQuestions.title : ''}</p>
                        <p style={{ fontSize: '0.8em', fontWeight: '300', color: 'rgb(200,200,200)' }}>from @Martin.Kamm</p>
                        <div className='bottom-element'>
                            <Button icon='thumbs down' size='large' circular/>
                            <Button icon='thumbs up' onClick={() => upvoteQuestion(voteOnQuestions)} size='large' circular primary/>
                            <div className='streamNextQuestionNumberOfVotes'>{voteOnQuestions ? voteOnQuestions.votes : ''}<Icon name='thumbs up'/></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='video-menu'>
                <div className='center'>
                    <Input action={{ content: 'ASK NOW', color: 'teal', onClick: () =>  addNewQuestion(newQuestionTitle)}} value={newQuestionTitle} onChange={(event) => {setNewQuestionTitle(event.target.value)}} fluid size='large' fluid placeholder='Write your question...' color='teal'/>
                </div>  
                <div className='right'>
                    <Button  icon='thumbs up' size='huge' color='pink' circular/>
                </div>     
            </div>
            <div className='video-menu-left'>
                <CurrentQuestionElement/>
                <div>
                    <div className='video-menu-left-reactions'>
                        <div style={{ margin: '0 0 5px 0', color: 'rgb(255, 20, 147)'}}>REACTIONS TO ANSWER</div>
                        <Grid centered>
                            <Grid.Column width={5} textAlign='center'>
                                <Icon name='thumbs up' color='pink' size='large' style={{ margin: '0 10px 0 0' }}/>
                                <span style={{ color: 'rgb(255, 20, 147)', fontSize: '1.3em' }}>12</span>
                            </Grid.Column>
                        </Grid>
                    </div>
                    <div id='scrollableLeft' className='video-menu-left-outer-content'>
                        <div  className='video-menu-left-content'>
                            { commentsElements }
                        </div>
                        <div className={'no-comment-message ' + (comments.length === 0 ? '' : 'hidden')}>
                            Be the first to react to this answer!
                        </div>
                    </div>
                    <div className='video-menu-left-input'>
                        <Input action={{ content: 'React', color: 'pink', onClick: () =>  addNewComment(newCommentTitle)}} value={newCommentTitle}  fluid placeholder='Send a reaction...' onChange={(event) => {setNewCommentTitle(event.target.value)}} />
                    </div>
                </div>
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

                .video-menu .center {
                    display: inline-block;
                    width: 600px;
                    padding: 3px 0 0 0;
                }

                .video-menu .right {
                    float: right;
                    padding: 0 20px 0 0;
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
                    min-width: 500px;
                    z-index: 8000;
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
                    z-index: -9999;
                    cursor: pointer;
                }

                .newQuestionPopup {
                    position: absolute;
                    bottom: 10px;
                    right: 10px;
                    width: 250px;
                    height: 200px;
                    border-radius: 5px;
                }

                #remoteVideo {
                    position: absolute;
                    width: 100%;
                    max-height: 100%;
                    height: auto;

                    top: 50%;
                    left: 50%;
                    transform: translate(-50%,-50%);
                    z-index: 9900;
                    background-color: black;
                }
                .streamNextQuestionContainer {
                    position: relative;
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
                    font-size: 1.3em;
                    border-radius: 5px;
                    display: block;
                    color: rgb(210,210,210);
                    font-size: 0.8em;
                    margin-top: 10px;
                }

                .bottom-element {
                    position: absolute;
                    bottom: 15px;
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

StreamPlayer.getInitialProps = ({ query }) => {
    return { livestreamId: query.livestreamId }
}

export default withFirebasePage(StreamPlayer);