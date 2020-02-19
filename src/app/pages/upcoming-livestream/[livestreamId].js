import React, {useState, useEffect,Fragment} from 'react';
import {Container, Button, Grid, Icon, Header as SemanticHeader, Input, Image} from "semantic-ui-react";

import Header from '../../components/views/header/Header';
import { withFirebasePage } from '../../data/firebase';
import { WebRTCAdaptor } from '../../static-js/webrtc_adaptor.js';
import TargetElementList from '../../components/views/common/TargetElementList'
import Loader from '../../components/views/loader/Loader'
import DateUtil from '../../util/DateUtil';
import CommonUtil from '../../util/CommonUtil';
import { useRouter } from 'next/router';
import Footer from '../../components/views/footer/Footer';
import Countdown from '../../components/views/common/Countdown';
import axios from 'axios';

function UpcomingLivestream(props) {

    const router = useRouter();

    const [user, setUser] = useState(null);
    const [upcomingQuestions, setUpcomingQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [newQuestionTitle, setNewQuestionTitle] = useState("");
    const [currentLivestream, setCurrentLivestream] = useState(null);

    const [loading, setLoading] = useState(false);
    const [registered, setRegistered] = useState(false);

    const eth_logo = 'https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Feth-career-center.png?alt=media&token=9403f77b-3cb6-496c-a96d-62be1496ae85';
    
    useEffect(() => {
        props.firebase.auth.onAuthStateChanged(user => {
            if (user !== null && user.emailVerified) {
                setUser(user);
            } else {
                setUser(null);
            }
        })
    }, []);

    useEffect(() => {
        if (props.livestreamId) {
            props.firebase.getScheduledLivestreamsUntreatedQuestions(props.livestreamId, querySnapshot => {
                var questionsList = [];
                querySnapshot.forEach(doc => {
                    let question = doc.data();
                    if (!userHasVotedOnQuestion(user, question)) {
                        question.id = doc.id;
                        questionsList.push(question);
                    } 
                });
                setUpcomingQuestions(questionsList);
            });
        }
    }, [props.livestreamId, user]);

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
        if (user && currentLivestream && currentLivestream.registeredUsers && currentLivestream.registeredUsers.indexOf(user.email) > -1) {
            setRegistered(true);
        } else {
            setRegistered(false);
        }
    }, [currentLivestream, user]);

    useEffect(() => {
        setCurrentQuestion(upcomingQuestions[0]);
    }, [upcomingQuestions]);

    function goToSeparateRoute(route) {
        window.open('http://testing.careerfairy.io' + route, '_blank');
    }

    function registerToLivestream() {
        if (!user) {
            return router.replace('/signup');
        }

        props.firebase.registerToLivestream(currentLivestream.id, user.email);
    }

    function deregisterFromLivestream() {
        if (!user) {
            return router.replace('/signup');
        }

        props.firebase.deregisterFromLivestream(currentLivestream.id, user.email);
    }

    function upvoteQuestion(question) {
        if (!user) {
            return router.replace('/signup');
        }

        props.firebase.upvoteQuestion(currentLivestream.id, question, user.email);
    }

    function downvoteQuestion(question) {
        if (!user) {
            return router.replace('/signup');
        }

        props.firebase.downvoteQuestion(currentLivestream.id, question, user.email);
    }

    function userHasVotedOnQuestion(user, question) {
        if (!user || !question.emailOfVoters) {
            return false;
        }
        return question.emailOfVoters.indexOf(user.email) > -1;
    }

    function getNumberOfRegistrants(livestream) {
        if (!livestream.registeredUsers) {
            return 0;
        }
        return livestream.registeredUsers.length;
    }

    function registerToLivestream(livestreamId) {
        if (!user) {
            return router.push('/signup');
        }

        props.firebase.registerToLivestream(livestreamId, user.email);
    }

    function deregisterFromLivestream(livestreamId) {
        if (!user) {
            return router.push('/signup');
        }

        props.firebase.deregisterFromLivestream(livestreamId, user.email);
    }

    function addNewQuestion() {
        debugger;
        if (!user) {
            return router.replace('/signup');
        }
        
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

    let questionElementsAlt = CommonUtil.getRandom(upcomingQuestions, 3).map((question, index) => {
        return (
            <Grid.Column>
                <div className='streamNextQuestionContainer' key={index}>
                    <p style={{ marginBottom: '5px' }}>{ question.title }</p>
                    <p style={{ fontSize: '0.8em', fontWeight: '300', color: 'rgb(200,200,200)' }}>from { question.author } </p>
                    <div className='bottom-element'>
                        <Button icon='delete' size='massive' onClick={() => downvoteQuestion(question)}  disabled={userHasVotedOnQuestion(user, question)} circular/>
                        <Button icon='thumbs up' size='massive' onClick={() => upvoteQuestion(question)} disabled={userHasVotedOnQuestion(user, question)} circular primary/>
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

    if (!currentLivestream) {
        return <Loader/>;
    }

    if (currentLivestream.hasStarted) {
        router.replace('/player-alt/' + currentLivestream.id);
    }

    return (
        <div>
            <div className='topLevelContainer'>
                <Header color='teal'/>
                <div className='video-mask' style={{backgroundImage: 'url(' + (currentLivestream ? currentLivestream.backgroundImageUrl : '') + ')'}}>
                    <div className='mask'>
                        <div className='topDescriptionContainer'>
                            <div>
                                <div className='livestream-label'>Live</div>
                                <div className='livestream-date'>
                                    <span style={{ color: 'rgb(0, 210, 170)', textTransform: 'uppercase' }}>{ currentLivestream ? DateUtil.getPrettyDate(currentLivestream.start.toDate()) : 'null' }</span>
                                </div>
                            </div>
                        </div>
                        <Container>
                            <div className='livestream-title'>
                                { currentLivestream ? currentLivestream.title : 'null' }
                            </div>
                            <div style={{ margin: '30px 0 50px 0'}}>
                                <Grid className='middle aligned' centered>
                                    <Grid.Column textAlign='center' mobile='5' computer='5'>
                                        <Image style={{ filter: 'brightness(0) invert(1)'}} src={(currentLivestream ? currentLivestream.companyLogoUrl : '')}/>
                                    </Grid.Column>
                                    <Grid.Column textAlign='center' mobile='5' computer='5'>
                                        <div className='livestream-speaker-image' style={{ backgroundImage: 'url(' + (currentLivestream ? currentLivestream.mainSpeakerAvatar : '') + ')'}}></div>
                                    </Grid.Column>
                                    <Grid.Column mobile='5' computer='5'>
                                        <div style={{ fontWeight: '700', fontSize: '1.4em', marginBottom: '10px', color: 'white' }}>{ currentLivestream ? currentLivestream.mainSpeakerName : '' }</div>
                                        <div style={{ fontWeight: '500', fontSize: '1.2em', marginBottom: '10px', color: 'white' }}>{ currentLivestream ? currentLivestream.mainSpeakerPosition : '' }</div>
                                    </Grid.Column>
                                </Grid> 
                            </div>
                            <div style={{ textAlign: 'center', marginBottom: '20px'}}>
                                <TargetElementList fields={ currentLivestream ? currentLivestream.targetGroups : [] }/>
                            </div>
                            <div style={{ margin: '20px 0 30px 0', width: '100%' }}>
                                <div>
                                    <Button size='big' content={ user ? ( registered ? 'Cancel Booking' : 'Book a spot') : 'Log in to Register' } icon={ user ? (registered ? 'delete' : 'plus') : 'sign-in' } style={{ margin: '5px' }} onClick={registered ? () => deregisterFromLivestream(currentLivestream.id) : () => registerToLivestream(currentLivestream.id)} primary={!registered}/>
                                </div>
                            </div>
                        </Container>   
                        <div className='bottom-icon'>
                            <div>see more</div>
                            <Icon style={{ color: 'white' }} name='angle down' size='big'/>
                        </div>
                        <div className='spots-left'>
                            <div className='spots-left-number'>{ 60 - getNumberOfRegistrants(currentLivestream) }</div>
                            <div className='spots-left-label'>spots left</div>
                        </div>   
                    </div>
                </div>
            </div>
            <div className='grey-container'>
                <Container>
                        <div className='container-title'>Your event starts here in</div>
                        <div style={{ marginTop: '30px', textAlign: 'center', color: 'rgb(0, 210, 170)'}}>
                            <Countdown date={ currentLivestream ? currentLivestream.start.toDate() : '' }/>
                        </div>
                </Container>
            </div>
            <div className='white-container'>
                <Container>
                        <div className='container-title'>Short summary</div>
                        <div style={{ fontSize: '1.5em', lineHeight: '1.4em', width: '80%', margin: '0 auto' }}>{ currentLivestream ? currentLivestream.description : 'null' }</div>
                </Container>
            </div>
            <div className='grey-container'>
                <Container>
                    <div className='container-title'>Upvote questions from your peers</div>
                    <Grid stackable columns={3} style={{ padding: '0 0 50px 0' }}>
                        { questionElementsAlt }
                    </Grid>
                    <div className='container-title'>Or ask Your Question</div>
                    <div style={{ textAlign: 'center' }}>
                        <Input size='huge' value={newQuestionTitle} onChange={(event) => setNewQuestionTitle(event.target.value)} action={{ content: 'Ask', color:'teal', onClick: () => addNewQuestion() }} disabled={!user} fluid/>
                    </div>
                </Container>
            </div>
            <div className='white-container'>
                <Container>
                    <div className='container-title'>Are you considering joining?</div>
                    <Grid style={{ margin: '50px 0 0 0'}}>
                        <Grid.Column width={8}>
                            <Image src={ currentLivestream ? currentLivestream.companyLogoUrl : 'null' } style={{ width: '50%', margin: '0 auto' }}/>
                        </Grid.Column>
                        <Grid.Column width={8} style={{ textAlign: 'left' }}>
                            <Button size='big' content='Apply To Talent Pool' icon='handshake outline' primary/> 
                        </Grid.Column>
                        <Grid.Column width={16}>
                            <div style={{ margin: '20px 0' }}>
                                We want to make it easy for students and young pros to find the right company for them. To help you let companies know that you're interested in potentially joining - now or in the future -, we've invented the Talent Pool. By joining its talent pool, the company can contact you at any time with a relevant opportunity.
                            </div>
                        </Grid.Column>
                    </Grid>
                </Container>
            </div>
            <div className='grey-container'>
                <div className='container-title'>We want to hear from you</div>
                <Container>
                    <Grid.Column width={16} style={{ textAlign: 'center' }}>
                        <Button size='big' content='I have an important question' style={{ margin: '30px 0 0 0' }}/> 
                    </Grid.Column>
                </Container>
            </div>
            <Footer/>
            <style jsx>{`
                .hidden {
                    display: none;
                }
    
                .topLevelContainer {
                    position: relative;
                    width: 100%;
                }

                .topDescriptionContainer {
                    width: 100%;
                    position: relative;
                    min-height: 50px;
                    margin: 0 0 40px 0;
                    padding: 0 30px;
                }

                .topDescriptionContainer div {
                    float: left;
                }
    
                .top-menu {
                    background-color: rgba(250,250,250,1);
                    padding: 15px 0;
                    height: 75px;
                    text-align: center;
                    position: relative;
                    box-shadow: 0 0 5px grey;
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
    
                .video-mask {
                    width: 100%;
                    background-color: rgb(230,230,230);
                    background-size: cover;
                    text-align: center;
                }
    
                .mask {
                    width: 100%;
                    padding: 20px 0 60px 0;
                    background-color: rgba(15, 37, 54,0.8);
                }

                .livestream-label {
                    color: white;
                    font-size: 0.9em;
                    border: 3px solid white;
                    display: inline-block;
                    font-weight: 700;
                    text-transform: uppercase;
                    padding: 5px 10px;
                    vertical-align: middle;
                    margin: 3px 10px 3px 0;
                }
    
                .livestream-title {
                    font-size: 3em;
                    color: white;
                    text-align: let;
                    line-height: 1.4em;
                    font-weight: 700;
                    text-shadow: 3px 3px 0 black;
                }
    
                .livestream-date {
                    display: inline-block;
                    text-align: right;
                    color: white;
                    font-weight: 500;
                    font-size: 1.2em;
                    vertical-align: middle;
                    margin: 10px 0;
                }
    
                .livestream-speaker-image {
                    display: inline-block;
                    padding-top: 50%;
                    width: 50%;
                    min-height: 60px;
                    min-width: 60px;
                    border-radius: 50%;
                    background-size: cover;
                    background-position: center center;
                    vertical-align: middle;
                    margin: 0 auto;
                }
    
                .livestream-speaker-name {
                    display: inline-block;
                    color: white;
                    vertical-align: middle;
                }
    
                .livestream-speaker-name div:first-child {
                    font-size: 1.4em;
                    margin: 0 0 5px 0;
                    font-weight: 600;
                }
    
                .video-mask-title {
                    width: 100%;
                    text-align: center;
                    font-weight: 600;
                    color: white;
                    z-index: 4000;
                    padding: 15px 0;
                }
    
                .live-now {
                    margin-bottom: 30px;
                    text-transform: uppercase;
                    font-size: 1.8em;
                    vertical-align: middle;
                    color: red;
                }
                .live-now span {
                    margin-left: 10px;
                }
                .live-now i, .live-now span {
                    vertical-align: middle;
                }
    
                .bottom-icon {
                    color: white;
                    position: absolute;
                    bottom: 10px;
                    width: 100%;
                    text-align: center;
                    font-size: 1.4em;
                }

                .container-title {
                    text-transform: uppercase;
                    text-align: center;
                    font-size: 1.1em;
                    font-weight: 700;
                    margin-bottom: 20px;
                    color: rgb(150,150,150);
                }

                .white-container {
                    padding: 40px 0 50px 0;
                    text-align: center;
                }
    
                .grey-container {
                    position: relative;
                    width: 100%;
                    padding: 40px 0 50px 0;
                    background-color: rgb(245,245,245);
                }

                .description {
                    width: 70%;
                    margin: 30px auto;
                    line-height: 1.4em;
                    text-align:center;
                }

                .spots-left {
                        position: absolute;
                        right: 40px;
                        bottom: 40px;
                        height: 100px;
                        width: 100px;
                        border-radius: 50%;
                        background-color: white;
                        text-align: center;
                        padding: 28px 0;
                    }

                    .spots-left-number {
                        font-size: 1.8em;
                        font-weight: 700;
                        color: rgb(0, 210, 170);
                    }

                    .spots-left-label {
                        font-size: 1em;
                        font-weight: 700;
                        margin: 5px 0;
                        color: rgb(44, 66, 81);
                    }
          `}</style>
        </div>
    );
}

UpcomingLivestream.getInitialProps = ({ query }) => {
    return { livestreamId: query.livestreamId }
}

export default withFirebasePage(UpcomingLivestream);