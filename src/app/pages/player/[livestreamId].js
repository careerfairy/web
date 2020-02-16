import React, {useState, useEffect,Fragment} from 'react';
import {Container, Button, Grid, Icon, Header as SemanticHeader, Input, Image} from "semantic-ui-react";

import Header from '../../components/views/header/Header';
import { withFirebasePage } from '../../data/firebase';
import { WebRTCAdaptor } from '../../static-js/webrtc_adaptor.js';
import DateUtil from '../../util/DateUtil';
import { useRouter } from 'next/router';
import Footer from '../../components/views/footer/Footer';
import axios from 'axios';

function StreamPlayer(props) {

    const [webRTCAdaptor, setWebRTCAdaptor] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isInitialized, setInitialized] = useState(false);
    const [isLoginModalOpen, setLoginModalOpen] = useState(true);

    const [authenticated, setAuthenticated] = useState(false);
    const [upcomingQuestions, setUpcomingQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [newQuestionTitle, setNewQuestionTitle] = useState("");
    const [currentLivestream, setCurrentLivestream] = useState(null);
    const [connectionSpeed, setConnectionSpeed] = useState(0);
    const [showNextQuestions, setShowNextQuestions] = useState(false);
    const [companies, setCompanies] = useState([]);

    const [nsToken, setNsToken] = useState(null);

    const [loading, setLoading] = useState(false);
    
    const eth_logo = 'https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Feth-career-center.png?alt=media&token=9403f77b-3cb6-496c-a96d-62be1496ae85';

    // useEffect(() => {
    //     props.firebase.auth.onAuthStateChanged(user => {
    //         if (user !== null && user.emailVerified) {
    //             setAuthenticated(true);
    //             setLoginModalOpen(false);
    //         } else {
    //             setAuthenticated(false);
    //             setLoginModalOpen(true);
    //         }
    //     })
    // }, []);

    // useEffect(() => {
    //     props.firebase.getCompanies().then( querySnapshot => {
    //         var companyList = [];
    //         querySnapshot.forEach(doc => {
    //             let company = doc.data();
    //             company.id = doc.id;
    //             companyList.push(company);
    //         });
    //         setCompanies(companyList);
    //     });
    // }, []);

    // useEffect(() => {
    //     setLoading(true);
    //     if (props.firebase.isSignInWithEmailLink(window.location.href)) {
    //         var email = window.localStorage.getItem('emailForSignIn');
    //         if (!email) {
    //           email = window.prompt('Please provide your email for confirmation');
    //         }
    //         props.firebase.signInWithEmailLink(email, window.location.href)
    //           .then(function(result) {
    //             window.localStorage.removeItem('emailForSignIn');
    //             setLoading(false);
    //           })
    //           .catch(function(error) {
    //             setLoading(false);
    //           });
    //       } else {
    //           setLoading(false);
    //       }
    // }, []);

    // useEffect(() => {
    //     if (isInitialized && currentLivestream && currentLivestream.hasStarted) {
    //         setTimeout(() => {
    //             startPlaying();
    //         }, 2000);
    //     }
    // }, [currentLivestream, isInitialized]);

    useEffect(() => {
        if (props.livestreamId) {
            props.firebase.listenToScheduledLivestreamById(props.livestreamId, querySnapshot => {
                let livestream = querySnapshot.data();
                livestream.id = querySnapshot.id;
                setCurrentLivestream(livestream);
        })
        }
    }, [props.livestreamId]);

    // useEffect(() => {
    //     if (props.livestreamId) {
    //         props.firebase.getScheduledLivestreamsUntreatedQuestions(props.livestreamId, querySnapshot => {
    //             var questionsList = [];
    //             querySnapshot.forEach(doc => {
    //                 let question = doc.data();
    //                 question.id = doc.id;
    //                 questionsList.push(question);
    //             });
    //             setUpcomingQuestions(questionsList);
    //         });
    //     }
    // }, [props.livestreamId]);

    // useEffect(() => {
    //     if (isPlaying && !authenticated) {
    //         setTimeout(() => {
    //             setLoginModalOpen(true);
    //         }, 10000);
    //     }
    // }, [isPlaying]);

    // useEffect(() => {
    //     if (navigator && navigator.connection) {
    //         setConnectionSpeed(navigator.connection.downlink);
    //     }
    // }, []);

    useEffect(() => {
        setCurrentQuestion(upcomingQuestions[0]);
    }, [upcomingQuestions]);

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
                video: true
            };

            setWebRTCAdaptor(new WebRTCAdaptor({
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
                        console.log("play_started"); 
                        setIsPlaying(true);
                    } else if (info === "play_finished") {
                        // play finished the stream
                        console.log("play_finished"); 
                        setIsPlaying(false);           
                    }
                },
                callbackError : function(error) {
                    //some of the possible errors, NotFoundError, SecurityError,PermissionDeniedError
                    console.log("error callback: " + error);
                    alert("An unexpected error occured while starting this livestream. Please reload this page and try again.");
                }
            }));
        }
    }, [nsToken]);

    function upvoteQuestion(question) {
        if (!authenticated) {
            return props.history.push('/signup');
        }

        props.firebase.upvoteQuestion(currentLivestream.id, question);
    }

    function startPlaying() {
        webRTCAdaptor.play(props.livestreamId);
    }

    // function addNewQuestion() {
    //     if (!authenticated) {
    //         return props.history.push('/signup');
    //     }
        
    //     const newQuestion = {
    //         title: newQuestionTitle,
    //         votes: 0,
    //         type: "new"
    //     }

    //     props.firebase.putScheduledLivestreamsQuestion(currentLivestream.id, newQuestion)
    //         .then(() => {
    //             setNewQuestionTitle("");
    //         }, () => {
    //             console.log("Error");
    //         })
    // }

    // function openMicrosoftLink() {
    //     var win = window.open('https://aka.ms/CareerFairy-Microsoft', '_blank');
    //     win.focus();
    // }

    // function uploadCV(logoFile, userName) {
    //     var storageRef = props.firebase.getStorageRef();
    //     let userCvRef = storageRef.child( 'user_cvs/' + userName  + '.pdf');

    //     var uploadTask = userCvRef.put(logoFile);

    //     uploadTask.on('state_changed',
    //         function(snapshot) {
    //             var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    //             console.log('Upload is ' + progress + '% done');
    //             switch (snapshot.state) {
    //                 case 'paused':
    //                 console.log('Upload is paused');
    //                 break;
    //                 case 'running':
    //                 console.log('Upload is running');
    //                 break;
    //                 default:
    //                 break;
    //             }
    //         }, function(error) {    
    //             switch (error.code) {
    //                 case 'storage/unauthorized':
    //                     // User doesn't have permission to access the object
    //                     break;
                
    //                 case 'storage/canceled':
    //                     // User canceled the upload
    //                     break;
                        
    //                 case 'storage/unknown':
    //                     // Unknown error occurred, inspect error.serverResponse
    //                     break;
    //                 default:
    //                     break;
    //             }
    //         }, function() {
    //             // Upload completed successfully, now we can get the download URL
    //             uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
    //                 console.log('File available at', downloadURL);
    //             });
    //         });
    // }

    let questionElementsAlt = upcomingQuestions.map((question, index) => {
        return (
            <Grid.Column>
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
});

// let companyLogos = companies.map((company, index) => {
//     if (index < 8) {
//         return (
//             <Grid.Column width={2}>
//                 <Image src={company.logoUrl} style={{ margin: '0 auto', maxWidth: '50%', maxHeight: '40px', filter: 'brightness(0)'}}/>
//             </Grid.Column>
//         );
//     } else {
//         return <div/>;
//     }
   
// });

if (currentLivestream && currentLivestream.hasStarted) {
    return (
        <div className='topLevelContainer'>
            <div className='top-menu'>
                <div style={{ position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)'}}>
                    <Image src='/logo_teal.png' style={{ maxHeight: '50px', maxWidth: '150px', display: 'inline-block', marginRight: '2px'}}/>
                    <Image src={ eth_logo } style={{ postion: 'relative', zIndex: '100', maxHeight: '50px', maxWidth: '150px', display: 'inline-block'}}/>
                    <div style={{ position: 'absolute', bottom: '13px', left: '120px', fontSize: '7em', fontWeight: '700', color: 'rgba(0, 210, 170, 0.2)', zIndex: '50'}}>&</div>
                </div>
                <div style={{ float: 'right', display: 'inlineBlock', margin: '0 20px' }}>
                    <Button size='big' onClick={() => setShowNextQuestions(!showNextQuestions)}>{ showNextQuestions ? 'Hide Questions' : 'Show Questions'}</Button>
                </div>
            </div>
            <div className='streamingContainer'>
                <video id="remoteVideo" autoPlay controls width='100%' style={{ border: '2px solid red'}}></video> 
            </div>
            <div className={ currentLivestream && currentLivestream.hasStarted && !isPlaying ? 'video-mask' : 'video-mask hidden'} style={{backgroundImage: 'url(' + (currentLivestream ? currentLivestream.backgroundImage : '') + ')'}}>
                <div className='mask'>
                    <div  className='video-mask-title'>
                        <div className='live-now animated flash slower infinite'><Icon name='circle' size='tiny'/><span>Live Now</span></div>
                        <Button icon='play' content='Join the Livestream' color='teal' size='huge' onClick={startPlaying} disabled={!isInitialized}/>
                    </div>
                </div>
            </div>
            <div className='video-menu'>
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
                        </div>
                    </div>
                    <div className='video-menu-questions-wrapper' style={{ display: 'none' }}>
                        <div className='video-menu-questions'>
                            { questionElementsAlt }
                        </div>
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
                    left: 0;
                    right: 0;
                    padding: 25px 0;
                    z-index: 1000;
                    text-align: center;
                    display: none;
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
    
                .speaker-info {
                    background-color: white;
                    border-radius: 10px;
                    margin: 30px 0;
                    padding: 30px 0;
                    box-shadow: 0 0 4px grey;
                }
    
                .streamingPlaceholder {
                    position: absolute;
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
    
                .video-mask {
                    position: absolute;
                    top: 75px;
                    left: 0;
                    width: 100%;
                    min-height: calc(100% - 75px);
                    height: auto;
                    background-color: rgb(230,230,230);
                    background-size: cover;
                }
    
                .mask {
                    position: absolute;
                    width: 100%;
                    min-height: 100%;
                    background-color: rgba(15, 37, 54,0.8);
                    padding: 15px 0 80px 0;
                }
          `}</style>
        </div>
    );

} else {
    return (
        <div>
            <div className='topLevelContainer'>
                <div className='top-menu'>
                    <div style={{ position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)'}}>
                        <Image src='/logo_teal.png' style={{ maxHeight: '50px', maxWidth: '150px', display: 'inline-block', marginRight: '2px'}}/>
                        <Image src={ eth_logo } style={{ postion: 'relative', zIndex: '100', maxHeight: '50px', maxWidth: '150px', display: 'inline-block'}}/>
                        <div style={{ position: 'absolute', bottom: '13px', left: '120px', fontSize: '7em', fontWeight: '700', color: 'rgba(0, 210, 170, 0.2)', zIndex: '50'}}>&</div>
                    </div>
                </div>
                <div className={ currentLivestream && currentLivestream.hasStarted ? 'video-mask hidden' : 'video-mask'} style={{backgroundImage: 'url(' + (currentLivestream ? currentLivestream.backgroundImage : '') + ')'}}>
                    <div className='mask'>
                        <Container>
                            <div className='livestream-title'>
                                { currentLivestream ? currentLivestream.title : 'null' }
                            </div>
                            <div className='livestream-date'>
                                { currentLivestream ? DateUtil.getPrettyDate(currentLivestream.start.toDate()) : 'null' }
                            </div>
                            <div>
                                <Grid className='middle aligned'>
                                    <Grid.Column width={4} textAlign='center'>
                                        <Image style={{ filter: 'brightness(0) invert(1)'}} src={(currentLivestream ? currentLivestream.companyLogoUrl : '')}/>
                                    </Grid.Column>
                                    <Grid.Column width={4} textAlign='center'>
                                        <div className='livestream-speaker-image' style={{ backgroundImage: 'url(' + (currentLivestream ? currentLivestream.speakerImageUrl : '') + ')'}}></div>
                                    </Grid.Column>
                                    <Grid.Column width={5}>
                                        <div style={{ color: 'white'}}>
                                            <div style={{ fontWeight: '700', fontSize: '1.4em', marginBottom: '10px' }}>{ currentLivestream ? currentLivestream.speakerName : '' }</div>
                                            <div style={{ fontWeight: '500', fontSize: '1.2em', marginBottom: '10px' }}>{ currentLivestream ? currentLivestream.speakerJob : '' }</div>
                                        </div>
                                    </Grid.Column>
                                </Grid> 
                            </div>
                            <div style={{ margin: '60px 0', width: '100%' }}>
                                <Button size='big' content='Register' icon='sign-in alternate' style={{ margin: '5px' }}/>
                                <Button size='big' content='Apply To Talent Pool' icon='handshake outline' style={{ margin: '5px' }} primary/>
                            </div>
                        </Container>   
                        <div className='bottom-icon'>
                            <div>see more</div>
                            <Icon style={{ color: 'white' }} name='angle down' size='big'/>
                        </div>   
                    </div>
                </div>
            </div>
            <div className='white-container'>
                <Container>
                        <div className='container-title'>Short summary</div>
                        <div style={{ fontSize: '1.5em', lineHeight: '1.4em', width: '80%', margin: '0 auto' }}>{ currentLivestream ? currentLivestream.description : 'null' }</div>
                </Container>
            </div>
            <div className='grey-container'>
                <Container>
                    <div className='container-title'>Tell us what you want to know</div>
                    <Grid stackable columns={3} style={{ padding: '0 0 50px 0' }}>
                        { questionElementsAlt }
                    </Grid>
                    <div className='container-title'>Ask Your Question</div>
                    <div style={{ textAlign: 'center' }}>
                        <Input size='huge' action={{ content: 'Ask', color:'teal' }} fluid/>
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
                                We want to make it easy for students and young pros to find the right company for them. To help you let companies know that you're interested in potentially joining - now or in the future -, we've invented the Talent Pool. If you're accepted in its Talent Pool, the company can contact you at any time with a relevant opportunity.
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
                }
    
                .mask {
                    width: 100%;
                    min-height: calc(100vh - 155px);
                    padding: 40px 0 40px 0;
                    background-color: rgba(15, 37, 54,0.8);
                }
    
                .livestream-title {
                    font-size: 3.5em;
                    color: white;
                    text-align: let;
                    line-height: 1.4em;
                    font-weight: 700;
                    text-shadow: 3px 3px 0 black;
                    width: 80%;
                }
    
                .livestream-date {
                    text-align: left;
                    margin: 30px 0 80px 0;
                    color: white;
                    font-weight: 500;
                    font-size: 1.5em;
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
                    padding: 40px 0 80px 0;
                    text-align: center;
                }
    
                .grey-container {
                    position: relative;
                    width: 100%;
                    padding: 40px 0 80px 0;
                    background-color: rgb(245,245,245);
                }

                .description {
                    width: 70%;
                    margin: 30px auto;
                    line-height: 1.4em;
                    text-align:center;
                }
          `}</style>
        </div>
    );
}

}

StreamPlayer.getInitialProps = ({ query }) => {
    return { livestreamId: query.livestreamId }
}

export default withFirebasePage(StreamPlayer);