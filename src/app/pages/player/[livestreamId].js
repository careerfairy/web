import React, {useState, useEffect,Fragment} from 'react';
import {Container, Button, Grid, Icon, Header as SemanticHeader, Input} from "semantic-ui-react";

import Header from '../../components/views/header/Header';
import { withFirebasePage } from '../../data/firebase';
import { WebRTCAdaptor } from '../../static-js/webrtc_adaptor.js';
import Countdown from 'react-countdown';
import ElementTagList from '../../components/views/common/ElementTagList';
import ClientFilePicker from '../../components/views/common/ClientFilePicker';
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
    const [nsToken, setNsToken] = useState(null);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        props.firebase.auth.onAuthStateChanged(user => {
            if (user !== null && user.emailVerified) {
                setAuthenticated(true);
                setLoginModalOpen(false);
            } else {
                setAuthenticated(false);
                setLoginModalOpen(true);
            }
        })
    }, []);

    useEffect(() => {
        setLoading(true);
        if (props.firebase.isSignInWithEmailLink(window.location.href)) {
            var email = window.localStorage.getItem('emailForSignIn');
            if (!email) {
              email = window.prompt('Please provide your email for confirmation');
            }
            props.firebase.signInWithEmailLink(email, window.location.href)
              .then(function(result) {
                window.localStorage.removeItem('emailForSignIn');
                setLoading(false);
              })
              .catch(function(error) {
                setLoading(false);
              });
          } else {
              setLoading(false);
          }
    }, []);

    useEffect(() => {
        if (props.firebase.isSignInWithEmailLink(window.location.href)) {
            var email = window.localStorage.getItem('emailForSignIn');
            if (!email) {
              email = window.prompt('Please provide your email for confirmation');
            }
            props.firebase.signInWithEmailLink(email, window.location.href)
              .then(function(result) {
                window.localStorage.removeItem('emailForSignIn');
              })
              .catch(function(error) {
              });
          }
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
    }, [props.livestreamId]);

    useEffect(() => {
        if (isPlaying && !authenticated) {
            setTimeout(() => {
                setLoginModalOpen(true);
            }, 10000);
        }
    }, [isPlaying]);

    useEffect(() => {
        debugger;
        if (navigator && navigator.connection) {
            setConnectionSpeed(navigator.connection.downlink);
        }
    }, []);

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
                        // play finished the stream
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
        webRTCAdaptor.play(currentLivestream.id);
    }

    function prettyPrintCountdown(props) {
        return props.days + (props.days === 1 ? ' day ' : ' days ')
        + props.hours + (props.hours === 1 ? ' hour ' : ' hours ') 
        + props.minutes + (props.minutes === 1 ? ' minute ' : ' minutes ')
        + props.seconds + (props.seconds === 1 ? ' second ' : ' seconds ');
    }

    function addNewQuestion() {
        if (!authenticated) {
            return props.history.push('/signup');
        }
        
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

    function openMicrosoftLink() {
        var win = window.open('https://aka.ms/CareerFairy-Microsoft', '_blank');
        win.focus();
    }

    function uploadCV(logoFile, userName) {
        var storageRef = props.firebase.getStorageRef();
        let userCvRef = storageRef.child( 'user_cvs/' + userName  + '.pdf');

        var uploadTask = userCvRef.put(logoFile);

        uploadTask.on('state_changed',
            function(snapshot) {
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case 'paused':
                    console.log('Upload is paused');
                    break;
                    case 'running':
                    console.log('Upload is running');
                    break;
                    default:
                    break;
                }
            }, function(error) {    
                switch (error.code) {
                    case 'storage/unauthorized':
                        // User doesn't have permission to access the object
                        break;
                
                    case 'storage/canceled':
                        // User canceled the upload
                        break;
                        
                    case 'storage/unknown':
                        // Unknown error occurred, inspect error.serverResponse
                        break;
                    default:
                        break;
                }
            }, function() {
                // Upload completed successfully, now we can get the download URL
                uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                    console.log('File available at', downloadURL);
                });
            });
    }

    let questionElements = upcomingQuestions.map((question, index) => {
        if (!currentQuestion || question.title !== currentQuestion.title) {
            return (
                    <div className='streamNextQuestionContainer' key={index}>
                        <p>{ question.title }</p>
                        <div className='streamNextQuestionNumberOfVotes'>{ question.votes } <Icon name='thumbs up' color='teal'/></div>
                        <Button id='scheduled-question-thumbs-up' color='teal' icon='thumbs up' onClick={() => upvoteQuestion(question)} content={'UPVOTE'}/>
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

                            .streamNextQuestionNumberOfVotes {
                                color: rgb(0, 210, 170);
                                font-weight: 600;
                                font-size: 1.3em;
                                padding: 10px;
                                border-radius: 5px;
                                display: inline-block;
                            }
                        `}</style>
                    </div>
            );
        } else {
            return (
                <div key={index}></div>
            );
        }
    });

    return (
        <Fragment>
        <div>
            <Header color='teal'/>
            <div className='companies-background'>
                <Container className='paddingContainer' textAlign='center'>
                <SemanticHeader as='h3' textAlign='left' color='grey'>Livestream: {currentLivestream ? currentLivestream.speakerName : ''}, {currentLivestream ? currentLivestream.speakerJob : ''} @ {currentLivestream ? currentLivestream.company : ''}</SemanticHeader>
                <Grid stackable>
                    <Grid.Row>
                        <Grid.Column width={10} textAlign='left'>
                            <div className='video-container'>
                                <video id="remoteVideo" autoPlay controls width="100%"></video> 
                                <div className={ currentLivestream && currentLivestream.hasStarted ? 'video-mask hidden' : 'video-mask'} style={{backgroundImage: 'url(' + (currentLivestream ? currentLivestream.backgroundImage : '') + ')'}}>
                                    <div  className='video-mask-title'>
                                        <p>This Livestream will start in</p>
                                        <Countdown date={currentLivestream ? currentLivestream.start.toDate() : null} renderer={(props) => prettyPrintCountdown(props)} />
                                    </div>
                                    <div className='video-mask-blur'>

                                    </div>
                                </div>
                                <div className={ currentLivestream && currentLivestream.hasStarted && !isPlaying ? 'video-mask' : 'video-mask hidden'} style={{backgroundImage: 'url(' + (currentLivestream ? currentLivestream.backgroundImage : '') + ')'}}>
                                    <div  className='video-mask-title'>
                                        <div className='live-now animated flash slower infinite'><Icon name='circle' size='tiny'/><span>Live Now</span></div>
                                        <Button icon='play' content='Join the Livestream' color='teal' size='huge' onClick={startPlaying} disabled={!isInitialized}/>
                                    </div>
                                    <div className='video-mask-blur'>

                                    </div>
                                </div>
                            </div>
                            <Button id='talent-pool' primary onClick={() => openMicrosoftLink()} style={{ margin: '20px 0' }} fluid className={ currentLivestream && currentLivestream.id === 'syEAzC45WXaLa880OXbp' ? '' : 'hidden'} size='large'>Join the Microsoft Talent Pool</Button>
                            { connectionSpeed }
                            <div className='questions-container'>
                                <p>SUBMIT YOUR QUESTION ANONYMOUSLY!</p>
                                <Input type='text' value={newQuestionTitle} onChange={(event) => setNewQuestionTitle(event.target.value)} fluid placeholder='Your question goes here!' action>
                                    <input />
                                    <Button primary onClick={() => addNewQuestion()}>SEND</Button>
                                </Input>
                            </div>
                            <ClientFilePicker onChange={fileObject => {uploadCV(fileObject, "mvoss")}}/>
                            <div className='speaker-container'>
                                <SemanticHeader as='h5' textAlign='left' color='grey'>Speaker(s)</SemanticHeader>
                                <Grid className='middle aligned' textAlign='left'>
                                    <Grid.Row>
                                        <Grid.Column width={7}>
                                            <div className='container-label'>
                                                Name
                                            </div>
                                            <div className='container-text'>
                                                { currentLivestream ? currentLivestream.speakerName : '' }
                                            </div>
                                        </Grid.Column>
                                        <Grid.Column width={7}>
                                            <div className='container-label'>
                                                Position
                                            </div>
                                            <div className='container-text'>
                                                { currentLivestream ? currentLivestream.speakerJob : '' }
                                            </div>
                                        </Grid.Column>
                                        <Grid.Column width={2}>
                                            <div className='container-text'>
                                                <a href={'https://www.linkedin.com/' + (currentLivestream ? currentLivestream.linkedinId : '') } target='_blank' rel='noopener noreferrer'><Icon name='linkedin alternate' size='big' color='blue' link/></a>
                                            </div>
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </div>
                            <div className='speaker-container'>
                                <SemanticHeader as='h5' textAlign='left' color='grey'>What You Should Know</SemanticHeader>
                                <Grid textAlign='left' columns={1}>
                                    <Grid.Row>
                                        <Grid.Column>
                                            <div className='container-description'>
                                                { currentLivestream ?  currentLivestream.description : '' }
                                            </div>
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </div>
                            <div className='speaker-container'>
                                <SemanticHeader as='h5' textAlign='left' color='grey'>Focus Backgrounds</SemanticHeader>
                                <Grid textAlign='left' columns={1}>
                                    <Grid.Row>
                                        <Grid.Column>
                                            <ElementTagList fields={currentLivestream ? currentLivestream.fieldsHiring : []}/>
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </div>
                        </Grid.Column>
                        <Grid.Column width={6}>
                            <SemanticHeader as='h3' textAlign='left' color='grey'>Question Stack</SemanticHeader>
                            <div className='streamQuestionsContainer'>
                                <div className='streamCurrentQuestionContainer'>
                                    CURRENT QUESTION:
                                    <div className='question'>{ currentQuestion ? currentQuestion.title : '' }</div>
                                    <div className='question-upvotes'><Icon name='thumbs up outline'/> { currentQuestion ? currentQuestion.votes : '' } upvotes</div>
                                </div>
                                <div className='streamQuestionsContainer'>
                                    { questionElements }
                                </div>
                            </div>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                </Container>
            </div>
            <style jsx>{`
                .hidden {
                    display: none;
                }

                .contentElement {
                    position: relative;
                }

                .streamQuestionContainer {
                    border: 1px solid rgb(0, 210, 170);
                }

                .currentQuestion {
                    padding: 20px;
                    font-size: 1.2em;
                    font-weight: 600;
                    color: white;
                    background-color: rgb(0, 210, 170);
                }

                .transparent {
                    color: white;
                }

                .questions-container {
                    margin-top: 20px;
                    text-align: left;
                }

                .questions-container p {
                    color: black;
                    font-weight: 600;
                    font-size: 1.2em;
                }

                .questions-container input {
                    height: 60px;
                    font-size: 1.2em;
                }

                .video-container {
                    position: relative;
                }

                .video-container .video-mask {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgb(230,230,230);
                    background-size: cover;

                }

                .streamNextQuestionNumberOfVotes {
                    color: rgb(0, 210, 170);
                    font-weight: 600;
                    font-size: 1.3em;
                    padding: 10px;
                    border-radius: 5px;
                    display: inline-block;
                }

                .video-mask-blur {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(20,20,20,0.6);
                    filter: blur(2px);
                    -webkit-filter: blur(2px);
                    z-index: 30;
                }

                .video-mask-title {
                    position: absolute;
                    width: 100%;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    font-weight: 600;
                    font-size: 1.3em;
                    color: rgb(0, 210, 170);
                    z-index: 40;
                }

                .video-mask-title p {
                    position: relative;
                    margin: 20px 0;
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

                .speaker-container {
                    background-color: white;
                    padding: 20px;
                    border-radius: 5px;
                    margin: 10px 0 10px 0;
                    box-shadow: 0 0 10px rgb(220,220,220);
                }
            `}</style>
        </div>
        </Fragment>   
    );
}

StreamPlayer.getInitialProps = ({ query }) => {
    return { livestreamId: query.livestreamId }
}

export default withFirebasePage(StreamPlayer);