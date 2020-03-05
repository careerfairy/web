import React, {useState, useEffect} from 'react';
import {Button, Grid, Icon, Image, Input, Modal} from "semantic-ui-react";

import Loader from '../../components/views/loader/Loader';

import PlaybackVideoContainer from '../../components/views/player-alt/video-container/PlaybackVideoContainer';
import CommentContainer from '../../components/views/player-alt/comment-container/NewCommentContainer';

import axios from 'axios';
import { withFirebasePage } from '../../data/firebase';
import { WebRTCAdaptor } from '../../static-js/webrtc_adaptor.js';
import { useRouter } from 'next/router';
import { animateScroll } from 'react-scroll';

function StreamPlayer(props) {

    const router = useRouter();
    const eth_logo = 'https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Feth-career-center.png?alt=media';
    const epfl_logo = 'https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Fepfl-career-center.png?alt=media';

    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    
    const [allQuestionsShown, setAllQuestionsShown] = useState(false);
    const [upcomingQuestions, setUpcomingQuestions] = useState([]);
    const [voteOnQuestions, setVoteOnQuestions] = useState(null);
    const [questionSubmittedModalOpen, setQuestionSubmittedModalOpen] = useState(false);
    const [newQuestionTitle, setNewQuestionTitle] = useState("");
    const [currentLivestream, setCurrentLivestream] = useState(null);

    useEffect(() => {
        props.firebase.auth.onAuthStateChanged(user => {
            if (user) {
                setUser(user);
            } else {
                router.replace('/login');
            }
        })
    }, []);

    useEffect(() => {
        if (user) {
            props.firebase.getUserData(user.email).then(querySnapshot => {
                let user = querySnapshot.data();
                if (user) {
                    setUserData(user);
                }
            });
        }
    },[user]);

    useEffect(() => {
        if (props.livestreamId) {
            const unsubscribe = props.firebase.listenToScheduledLivestreamById(props.livestreamId, querySnapshot => {
                let livestream = querySnapshot.data();
                livestream.id = querySnapshot.id;
                setCurrentLivestream(livestream);
            })
            return () => unsubscribe();
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
        if (user && upcomingQuestions && upcomingQuestions.length > 0) {
            let questionsToBeVoted = upcomingQuestions.filter(question => {
                if (user && question.author === user.email) {
                    return false;
                } else if (question.emailOfVoters) {
                    return question.emailOfVoters.indexOf(user.email) === -1;
                } else {
                    return true;
                }
            });
            setVoteOnQuestions(questionsToBeVoted[0]);
        }
    }, [upcomingQuestions]);

    function upvoteLivestreamQuestion(question) {
        props.firebase.upvoteLivestreamQuestion(currentLivestream.id, question, user.email).then(() => {
            setVoteOnQuestions(null);
        });
    }

    let questionElements = upcomingQuestions.map((question, index) => {
        return (
            <Grid.Column width={5} key={index}>
                <div className='streamNextQuestionContainer'>
                    <p style={{ marginBottom: '5px' }}>{ question.title }</p>
                    <div className='bottom-element'>
                        <Button icon='thumbs up' onClick={() => upvoteLivestreamQuestion(question)} size='large' content='Upvote' primary/>
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
    });

    function addNewQuestion() {
        if (!user ||!(newQuestionTitle.trim()) || newQuestionTitle.trim().length < 5) {
            return;
        }

        const newQuestion = {
            title: newQuestionTitle,
            votes: 0,
            type: "new",
            author: user.email
        }
        props.firebase.putLivestreamQuestion(currentLivestream.id, newQuestion)
            .then(() => {
                setNewQuestionTitle("");
                setQuestionSubmittedModalOpen(true);
            }, () => {
                console.log("Error");
        })
    }

    function addNewQuestionOnEnter(target) {
        if(target.charCode==13){
            addNewQuestion();   
        } 
    }

    if (!currentLivestream) {
        return <Loader/>;
    }

//    /*  if (!currentLivestream.hasStarted) {
//         router.replace('/upcoming-livestream/' + currentLivestream.id);
//     } */

    return (
        <div className='topLevelContainer'>
            <div className='top-menu'>
                <div style={{ position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)'}}>
                    <Image src='/logo_teal.png' style={{ maxHeight: '50px', maxWidth: '150px', display: 'inline-block', marginRight: '2px'}}/>
                    <Image src={ eth_logo } style={{ postion: 'relative', zIndex: '100', maxHeight: '50px', maxWidth: '150px', display: 'inline-block'}}/>
                    <Image src={ epfl_logo } style={{ postion: 'relative', zIndex: '100', maxHeight: '50px', maxWidth: '150px', display: 'inline-block', marginLeft: '15px'}}/>
                    <div style={{ position: 'absolute', bottom: '13px', left: '120px', fontSize: '7em', fontWeight: '700', color: 'rgba(0, 210, 170, 0.2)', zIndex: '50'}}>&</div>
                </div>
            </div>
            <div className='streamingOuterContainer'>
                <PlaybackVideoContainer livestream={ currentLivestream }/>
                <div className='video-menu'>
                    <div  className='video-menu-input'>
                        <Input action={{ content: 'Add a Question', color: 'teal', onClick: () => addNewQuestion() }} size='huge' maxLength='140' onKeyPress={addNewQuestionOnEnter} value={newQuestionTitle} fluid placeholder='Add your question...' onChange={(event) => {setNewQuestionTitle(event.target.value)}} />
                    </div>
                </div> 
            </div>
            <div className='video-menu-left'>  
                <CommentContainer livestream={ currentLivestream } userData={userData} user={user} />
            </div>           
            <div className={'all-questions-modal ' + (allQuestionsShown ? '' : 'hidden')}>
                <Icon name='delete' onClick={() => setAllQuestionsShown(false)} size='large' style={{ position: 'absolute', top: '10px', right: '10px', color: 'white', zIndex: '9999', cursor: 'pointer'}}/>
                <Grid centered>
                    { questionElements }
                </Grid>
            </div>
            <Modal
                style={{ zIndex: '9999' }}
                open={questionSubmittedModalOpen}
                onClose={() => setQuestionSubmittedModalOpen(false)}>
                <Modal.Content>
                    <h3>Thank you! You question has been submitted to the vote of the audience!</h3>
                </Modal.Content>
                <Modal.Actions>
                <Button primary onClick={() => setQuestionSubmittedModalOpen(false)}>
                    <Icon name='checkmark' /> Got it
                </Button>
                </Modal.Actions>
            </Modal>
            <style jsx>{`
                .hidden {
                    display: none;
                }

                .connecting-overlay {
                    position:absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(255,255,255,1);
                }

                .connecting-overlay-content {
                    position: absolute;
                    top:50%;
                    left:50%;
                    transform: translate(-50%, -50%);
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
                    left: 0;
                    right: 0;
                    z-index: 3000;
                    padding: 12px;
                    text-align: center;
                    width: 100%;
                }

                .video-menu .center {
                    display: inline-block;
                    width: 600px;
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
                    bottom: 0;
                    left: 360px;
                    right: 0;
                    min-width: 800px;
                    z-index: 1000;
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

                .playButton {
                    position: absolute;
                    font-size: calc(1em + 1.2vw);
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    z-index: 9991;
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
                    width: 360px;
                    z-index: 1;
                }

                .chat-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    width: 100%;
                }

                .chat-container.active {
                    top: 190px;
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
                    width: 100%;
                    position: absolute;
                    top: 60px;
                    left: 0;
                    bottom: 40px;                   
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
                    height: 100%;
                    width: 100%;
                    padding: 10px 20px;
                }

                .video-menu-right {
                    position: absolute;
                    top: 75px;
                    right: 10px;
                    bottom: 60px;
                    overflow: hidden;
                    width: 360px;
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

                @media (max-width: 768px) {
                    .streamingOuterContainer {
                        position: relative;
                        top: 0;
                        left: 0;
                        z-index: 1000;
                        padding-top: 56%;
                        height: 0;
                        min-height: 400px;
                        width: 100%;
                        min-width: 0;
                        margin: 0;
                    }

                    .video-menu-left {
                        position: relative;
                        top: 0;
                        width: 100%;
                        min-height: 600px;
                        z-index: 1;
                        margin: 0;
                    }   
                }
          `}</style>
        </div>
    );
}

StreamPlayer.getInitialProps = ({ query }) => {
    return { livestreamId: query.livestreamId }
}

export default withFirebasePage(StreamPlayer);