import {useState, useEffect, useRef, Fragment} from 'react';
import {Container, Button, Grid, Header as SemanticHeader, Icon, Image, Input, Modal, Transition, Dropdown} from "semantic-ui-react";

import { useRouter } from 'next/router';
import { withFirebasePage } from '../../../data/firebase';
import useWebRTCAdaptor from '../../../components/custom-hook/useWebRTCAdaptor';
import CurrentSpeakerDisplayer from '../../../components/views/streaming/video-container/CurrentSpeakerDisplayer';
import SmallStreamerVideoDisplayer from '../../../components/views/streaming/video-container/SmallStreamerVideoDisplayer';
import NewCommentContainer from 'components/views/streaming/comment-container/NewCommentContainer';

function ViewerPage(props) {

    const router = useRouter();
    const livestreamId = router.query.livestreamId;

    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);

    const [questionSubmittedModalOpen, setQuestionSubmittedModalOpen] = useState(false);

    const [userIsInTalentPool, setUserIsInTalentPool] = useState(false);
    const [currentLivestream, setCurrentLivestream] = useState(false);

    const [careerCenters, setCareerCenters] = useState([]);

    const [upcomingQuestions, setUpcomingQuestions] = useState([]);
    const [pastQuestions, setPastQuestions] = useState([]);

    const [mediaConstraints, setMediaConstraints] = useState({ audio: true, video: true});
    const [speakingLivestreamId, setSpeakingLivestreamId] = useState(livestreamId);

    const streamerReady = true;
    const isPlayMode = true;
    const localVideoId = null;
    const streamingCallbacks = {};
    const errorCallbacks = {
        onOtherError: (error) => {}
    };
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
        if (currentLivestream) {
            props.firebase.getLivestreamCareerCenters(currentLivestream.universities).then( querySnapshot => {
                let groupList = [];
                querySnapshot.forEach(doc => {
                    let group = doc.data();
                    group.id = doc.id;
                    groupList.push(group);
                });
                setCareerCenters(groupList);
            });
        }
    }, [currentLivestream]);

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

    let logoElements = careerCenters.map( (careerCenter, index) => {
        return (
            <Fragment>
                <Image src={ careerCenter.logoUrl } style={{ maxWidth: '150px', maxHeight: '50px', marginRight: '15px', display: 'inline-block' }}/>
            </Fragment>
        );
    });

    return (
        <div className='topLevelContainer'>
            <div className='top-menu'>
                <div className='top-menu-left'>    
                    <Image src='/logo_teal.png' style={{ maxHeight: '50px', maxWidth: '150px', display: 'inline-block', marginRight: '2px'}}/>
                    { logoElements }
                    <div style={{ position: 'absolute', bottom: '13px', left: '120px', fontSize: '7em', fontWeight: '700', color: 'rgba(0, 210, 170, 0.2)', zIndex: '50'}}>&</div>
                </div>
                <div className={'top-menu-right'}>
                    <Image src={ currentLivestream.companyLogoUrl } style={{ position: 'relative', zIndex: '100', maxHeight: '50px', maxWidth: '150px', display: 'inline-block', margin: '0 10px'}}/>
                    <Button style={{ display: currentLivestream.hasNoTalentPool ? 'none' : 'inline-block' }}size='big' content={ userIsInTalentPool ? 'Leave Talent Pool' : 'Join Talent Pool'} icon={ userIsInTalentPool ? 'delete' : 'handshake outline'} onClick={ userIsInTalentPool ? () => leaveTalentPool() : () => joinTalentPool()} primary={!userIsInTalentPool}/> 
                </div>
            </div>
            <div className='black-frame'>
                <div>
                    <CurrentSpeakerDisplayer isPlayMode={true} smallScreenMode={currentLivestream.mode === 'presentation'} speakerSwitchModeActive={false} streams={externalMediaStreams} currentSpeaker={currentLivestream.currentSpeakerId} muted={!currentLivestream.hasStarted }/>
                </div>
                <div style={{ display: (currentLivestream.mode === 'presentation' ? 'block' : 'none')}}>
                    <SmallStreamerVideoDisplayer isPlayMode={true} streams={externalMediaStreams} livestreamId={currentLivestream.id} presenter={false}/>
                </div>
                <div className={ currentLivestream.hasStarted ? 'hidden' : '' }style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'white', zIndex: '9999'}}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '1.4em', fontWeight: '700', color: 'rgb(0, 210, 170)'}}>
                        Thank you for joining!
                    </div>
                </div>
            </div>  
            <div className='video-menu-left'>
                <NewCommentContainer streamer={false} livestream={ currentLivestream } user={user} userData={userData}/>
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

                .topLevelContainer {
                    position: relative;
                    min-height: 100vh;
                }

                .top-menu {
                    background-color: rgba(245,245,245,1);
                    padding: 15px 0;
                    height: 75px;
                    text-align: center;
                    position: relative;
                }

                @media(max-width: 768px) {
                    .top-menu {
                        display: none;
                    }
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
                    z-index: 10;
                    background-color: black;
                }

                @media(max-width: 768px) {
                    .black-frame {
                        position: absolute;
                        width: 100%;
                        height: 60vh;
                        top: 0;
                        left: 0;
                    }
                }

                @media(min-width: 768px) {
                    .black-frame {
                        position: absolute;
                        top: 75px;
                        bottom: 0;
                        left: 280px;
                        width: calc(100% - 280px);
                    }
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
                    z-index: 15;
                }

                @media(max-width: 768px) {
                    .video-menu-left {
                        position: absolute;
                        top: 60vh;
                        left: 0;
                        width: 100%;
                        height: 100vh;
                    }
                }

                @media(min-width: 768px) {
                    .video-menu-left {
                        position: absolute;
                        top: 75px;
                        left: 0;
                        bottom: 0;
                        width: 280px;
                    }
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