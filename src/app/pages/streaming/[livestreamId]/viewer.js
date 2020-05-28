import {useState, useEffect, useRef, Fragment} from 'react';
import {Container, Button, Grid, Header as SemanticHeader, Icon, Image, Input, Modal, Transition, Dropdown} from "semantic-ui-react";

import { useRouter } from 'next/router';
import ViewerVideoContainer from '../../../components/views/streaming/video-container/ViewerVideoContainer';
import { withFirebasePage } from '../../../data/firebase';
import NewCommentContainer from '../../../components/views/viewer/comment-container/NewCommentContainer';
import SmallViewerVideoDisplayer from '../../../components/views/streaming/video-container/SmallViewerVideoDisplayer';
import ViewerVideoDisplayer from '../../../components/views/streaming/video-container/ViewerVideoDisplayer';
import LivestreamPdfViewer from '../../../components/util/LivestreamPdfViewer';
import useWebRTCAdaptor from '../../../components/custom-hook/useWebRTCAdaptor';
import CurrentSpeakerDisplayer from '../../../components/views/streaming/video-container/CurrentSpeakerDisplayer';
import SmallStreamerVideoDisplayer from '../../../components/views/streaming/video-container/SmallStreamerVideoDisplayer';

function ViewerPage(props) {

    const eth_logo = 'https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Feth-career-center.png?alt=media';
    const epfl_logo = 'https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Fepfl-career-center.png?alt=media';
    const uzh_logo = 'https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Fjobhub.png?alt=media';
    const polyefair_logo = 'https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Fpolyefair_logo.png?alt=media';

    const router = useRouter();
    const livestreamId = router.query.livestreamId;

    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);

    const [isPlaying, setIsPlaying] = useState(false);

    const [questionSubmittedModalOpen, setQuestionSubmittedModalOpen] = useState(false);

    const [userIsInTalentPool, setUserIsInTalentPool] = useState(false);
    const [currentLivestream, setCurrentLivestream] = useState(false);
    const [registeredStreamers, setRegisteredStreamers] = useState([]);

    const [newQuestionTitle, setNewQuestionTitle] = useState("");

    const [upcomingQuestions, setUpcomingQuestions] = useState([]);
    const [pastQuestions, setPastQuestions] = useState([]);

    const [initalReactionSent, setInitialReactionSent] = useState(false);
    const [mediaConstraints, setMediaConstraints] = useState({ audio: true, video: true});
    const [speakingLivestreamId, setSpeakingLivestreamId] = useState(null);

    const streamerReady = true;
    const isPlayMode = true;
    const localVideoId = null;
    const streamingCallbacks = {};
    const errorCallbacks = {};
    const streamerId = null;

    const { webRTCAdaptor, externalMediaStreams, audioLevels } = 
        useWebRTCAdaptor(
            streamerReady,
            isPlayMode,
            localVideoId,
            mediaConstraints,
            streamingCallbacks,
            errorCallbacks,
            livestreamId,
            streamerId
        );

    useEffect(() => {
        if (currentLivestream.id) {
            const unsubscribe = props.firebase.listenToLivestreamQuestions(currentLivestream.id, querySnapshot => {
                var upcomingQuestionsList = [];
                var pastQuestionsList = [];
                querySnapshot.forEach(doc => {
                    let question = doc.data();
                    question.id = doc.id;
                    if (question.type !== 'done') {
                        upcomingQuestionsList.push(question);
                    } else {
                        pastQuestionsList.push(question);
                    }
                });
                setUpcomingQuestions(upcomingQuestionsList);
                setPastQuestions(pastQuestionsList);
            });
            return () => unsubscribe();
        }
    }, [currentLivestream.id]);

    useEffect(() => {
        if (currentLivestream) {
            if (currentLivestream.test === true) {
                var testUser = {
                    firstName: 'Tester',
                    lastName: 'Tester'
                };
                props.firebase.auth.onAuthStateChanged(user => {
                    if (user) {
                        setUser(user);
                    } else {
                        setUserData(testUser);
                    }
                });
            } else {
                props.firebase.auth.onAuthStateChanged(user => {
                    if (user) {
                        setUser(user);
                    } else {
                        router.replace('/login');
                    }
                });
            }
        }
    }, [currentLivestream]);

    useEffect(() => {
        if (user) {
            props.firebase.listenToUserData(user.email, querySnapshot => {
                let user = querySnapshot.data();
                if (user) {
                    setUserData(user);
                }
            });
        }
    },[user]);
    
    useEffect(() => {
        if (livestreamId) {
            props.firebase.listenToScheduledLivestreamById(livestreamId, querySnapshot => {
                let livestream = querySnapshot.data();
                livestream.id = querySnapshot.id;
                setCurrentLivestream(livestream);
            });
        }
    }, [livestreamId]);

    useEffect(() => {
        if (audioLevels && audioLevels.length > 0) {
            const maxEntry = audioLevels.reduce((prev, current) => (prev.audioLevel > current.audioLevel) ? prev : current);
            setSpeakingLivestreamId(maxEntry.streamId);
        }
    }, [audioLevels]);

    useEffect(() => {
        if (livestreamId) {
            const unsubscribe = props.firebase.listenToConnectedLivestreamLiveSpeakers(livestreamId, querySnapshot => {
                let liveSpeakersList = [];
                querySnapshot.forEach(doc => {
                    let speaker = doc.data();
                    speaker.id = doc.id;
                    liveSpeakersList.push(speaker);
                });
                setRegisteredStreamers(liveSpeakersList);
            });
            return () => unsubscribe();
        }
    }, [livestreamId]);

    useEffect(() => {
        if (userData && currentLivestream && userData.talentPools && userData.talentPools.indexOf(currentLivestream.companyId) > -1) {
            setUserIsInTalentPool(true);
        } else {
            setUserIsInTalentPool(false);
        }
    }, [currentLivestream, userData]);

    function joinTalentPool() {
        if (!user) {
            return router.replace('/signup');
        }

        props.firebase.joinCompanyTalentPool(currentLivestream.companyId, user.email);
    }

    function leaveTalentPool() {
        if (!user) {
            return router.replace('/signup');
        }

        props.firebase.leaveCompanyTalentPool(currentLivestream.companyId, user.email);
    }

    function getContainerWidth(length) {
        if (currentLivestream.mode === 'presentation') {
            return 4;
        } else {
            return length > 1 ? 8 : 16;
        }
    }

    let connectedStreamers = registeredStreamers.filter(streamer => streamer.connected);
    let videoElements = connectedStreamers.map( (streamer, index) => {
        return (
            <Fragment>
                <Grid.Column width={ getContainerWidth(connectedStreamers.length) } style={{ padding: 0 }} key={streamer.id}>
                    <ViewerVideoContainer streamer={streamer} length={connectedStreamers.length} index={index + 1} isPlaying={isPlaying} height={'100%'} hasStarted={currentLivestream.hasStarted}/>
                </Grid.Column>
            </Fragment>
        );
    });

    function isUniversityLivestream(university) {
        if (currentLivestream) {
            return currentLivestream.universities.indexOf(university) > -1;
        }
    }

    function addNewQuestion() {
        if (!userData ||!(newQuestionTitle.trim()) || newQuestionTitle.trim().length < 5) {
            return;
        }

        const newQuestion = {
            title: newQuestionTitle,
            votes: 0,
            type: "new",
            author: !currentLivestream.test ? user.email : 'test@careerfairy.io'
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

    function sendInstantReaction(reaction) {
        const newComment = {
            title: reaction,
            author: userData ? (userData.firstName + ' ' + userData.lastName.charAt(0)) : 'anonymous',
        }
        props.firebase.putQuestionComment(currentLivestream.id, upcomingQuestions[0].id, newComment)
            .then(() => {}, error => {
                console.log("Error: " + error);
            })
    }

    let initialReactions = currentLivestream.language === 'DE' ? ['Hallo!', 'Hoi zäme', 'Hi! :-)'] : ['Hello!', 'Hi everyone!', 'How do you do?'];

    let reactionElements = initialReactions.map((reaction, index) => {
        return (
            <Grid.Column width={5} key={index}>
                <div onClick={() => {sendInstantReaction(reaction); setInitialReactionSent(true);}} style={{ cursor: 'pointer', position: 'relative', backgroundColor: 'white', color: 'grey', padding: '20px', borderRadius: '20px', textAlign: 'left' }}>
                    <div style={{ textTransform: 'capitalize', fontSize: '0.9em', fontWeight: '400', color: 'black', textAlign: 'left', marginBottom: '0', minWidth: '200px'}}>{ reaction }</div>
                    <div style={{ textTransform: 'capitalize', fontSize: '0.7em', fontWeight: '400', color: 'grey', textAlign: 'left', margin: '0'}}>@{userData ? (userData.firstName + ' ' + userData.lastName.charAt(0)) : 'anonymous'}</div>
                    <Button circular icon='chevron right circle' style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)'}} primary/>
                </div>
            </Grid.Column>
        );
    });

    return (
        <div className='topLevelContainer'>
            <div className='top-menu'>
                <div className='top-menu-left'>    
                    <Image src='/logo_teal.png' style={{ maxHeight: '50px', maxWidth: '150px', display: 'inline-block', marginRight: '2px'}}/>
                    <Image src={ eth_logo } style={{ maxWidth: '150px', maxHeight: '50px', marginRight: '15px', display: isUniversityLivestream("ethzurich") ? 'inline-block' : 'none' }}/>
                    <Image src={ epfl_logo } style={{ maxWidth: '150px', maxHeight: '50px', marginRight: '15px', display: isUniversityLivestream("epflausanne") ? 'inline-block' : 'none' }}/>
                    <Image src={ uzh_logo } style={{ maxWidth: '150px', maxHeight: '50px', display: isUniversityLivestream("unizurich") ? 'inline-block' : 'none' }}/>
                    <Image src={ polyefair_logo } style={{ maxWidth: '150px', maxHeight: '50px', display: isUniversityLivestream("polyefair") ? 'inline-block' : 'none' }}/>
                    <div style={{ position: 'absolute', bottom: '13px', left: '120px', fontSize: '7em', fontWeight: '700', color: 'rgba(0, 210, 170, 0.2)', zIndex: '50'}}>&</div>
                </div>
                <div className='top-menu-right'>
                    <Image src={ currentLivestream.companyLogoUrl } style={{ position: 'relative', zIndex: '100', maxHeight: '50px', maxWidth: '150px', display: 'inline-block', margin: '0 10px'}}/>
                    <Button size='big' content={ userIsInTalentPool ? 'Leave Talent Pool' : 'Join Talent Pool'} icon={ userIsInTalentPool ? 'delete' : 'handshake outline'} onClick={ userIsInTalentPool ? () => leaveTalentPool() : () => joinTalentPool()} primary={!userIsInTalentPool}/> 
                </div>
            </div>
            <div className='black-frame'>
                <div style={{ display: (currentLivestream.mode === 'default' ? 'block' : 'none')}}>
                    <CurrentSpeakerDisplayer isPlayMode={true} streams={externalMediaStreams} currentSpeaker={speakingLivestreamId}/>
                </div>
                <div style={{ display: (currentLivestream.mode === 'presentation' ? 'block' : 'none')}}>
                    <SmallStreamerVideoDisplayer isPlayMode={true} streams={externalMediaStreams} livestreamId={currentLivestream.id} presenter={false}/>
                </div>
                <div className={'reactions-sender ' + (initalReactionSent ? 'animated fadeOut' : '')}>
                    <div style={{ fontSize: '2em', margin: '0 0 40px 0'}}>How about saying hello?</div>
                    <Grid textAlign='center'>
                        { reactionElements }
                    </Grid>
                    <div onClick={() => setInitialReactionSent(true)} style={{ margin: '15px 0 0 0', fontSize: '0.9em', fontWeight: '300', textDecoration: 'underline', cursor: 'pointer' }}>No, I am here undercover!</div>
                    <Icon onClick={() => setInitialReactionSent(true)}  name='delete' size='large' style={{ position: 'absolute', top: '20px', right: '20px', color: 'white', cursor: 'pointer'}} />
                </div>
            </div>  
            <div className='video-menu'>
                <div  className='video-menu-input'>
                        <Input action={{ content: 'Add a Question', color: 'teal', onClick: () => addNewQuestion() }} size='huge' maxLength='140' onKeyPress={addNewQuestionOnEnter} value={newQuestionTitle} fluid placeholder='Add your question...' onChange={(event) => {setNewQuestionTitle(event.target.value)}} />
                    </div>
                </div>  
            <div className='video-menu-left'>
                <NewCommentContainer livestream={ currentLivestream } upcomingQuestions={upcomingQuestions} pastQuestions={pastQuestions} userData={userData}  user={user}/>
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
                    display: none
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

                .top-menu-left {
                    display: block;
                    position: absolute;
                    top: 50%;
                    left: 20px;
                    transform: translateY(-50%);
                }

                .top-menu-right {
                    position: absolute;
                    top: 50%;
                    right: 20px;
                    transform: translateY(-50%);
                }

                .remoteVideoContainer {
                    position: absolute;
                    top: 20px;
                    left: 50%;
                    transform: translate(-50%);
                    width: 80%;
                    height: 200px;
                }

                #localVideo {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    max-height: 100%;
                    height: auto;
                    z-index: 9900;
                    background-color: black;
                }

                .side-button {
                    cursor: pointer;
                }

                .test-title {
                    font-size: 2em;
                    margin: 30px 0;
                }

                .test-button {
                    margin: 20px 0;
                }

                .test-hint {
                    margin: 20px 0;
                }

                .teal {
                    color: rgb(0, 210, 170);
                    font-weight: 700;
                }

                .black-frame {
                    position: absolute;
                    top: 75px;
                    bottom: 85px;
                    left: 330px;
                    width: calc(100% - 330px);
                    min-width: 700px;
                    min-height: 600px;
                    z-index: 10;
                    background-color: black;
                }

                .video-box {
                    position: relative;
                    width: 100%;
                    height: calc(100% - 85px);
                    background-color: black;
                }

                .video-box-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: white;
                    z-index: 9999;
                }

                .video-box-overlay-content {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }

                .reactions-sender {
                    position: absolute;
                    padding: 30px 0;
                    top: 50%;
                    transform: translateY(-50%);
                    left: 0;
                    right: 0;
                    z-index: 1100;
                    text-align: center;
                    background-color: rgba(0,0,0,0.6);
                }

                .reactions-sender div {
                    margin-bottom: 20px;
                    font-weight: 700;
                    font-size: 1.2em;
                    color: white;
                }

                .video-menu {
                    position: absolute;
                    bottom: 0;
                    left: 330px;
                    right: 0;
                    height: 85px;
                    z-index: 3000;
                    padding: 12px;
                    text-align: center;
                    width: calc(100% - 330px);
                    background-color: white;
                }

                .video-menu .center {
                    display: inline-block;
                    width: 600px;
                }

                .video-menu .right {
                    float: right;
                    padding: 0 20px 0 0;
                }

                .video-menu-left {
                    position: absolute;
                    top: 75px;
                    left: 0;
                    bottom: 0;
                    width: 330px;
                    z-index: 1;
                }

                .button-container {
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    width: 100%;
                    height: 90px;
                    cursor:  pointer;
                    padding: 17px;
                    z-index: 8000;
                }

                .left-container {
                    position: absolute;
                    left: 0;
                    top: 0;
                    height: calc(100% - 75px);
                    width: 120px;
                    padding: 20px;
                    background-color: rgb(80,80,80);
                }

                .logo-container {
                    position: absolute;
                    bottom: 90px;
                    left: 0;
                    right: 0;
                    color: rgb(0, 210, 170);
                    font-size: 1.4em;
                    text-align: center;
                }
            `}</style>
        </div>
    );
}

export default withFirebasePage(ViewerPage);