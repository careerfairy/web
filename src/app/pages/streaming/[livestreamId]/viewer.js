import {useState, useEffect, useRef, Fragment} from 'react';
import {Container, Button, Grid, Header as SemanticHeader, Icon, Image, Input, Modal, Transition, Dropdown} from "semantic-ui-react";

import { useRouter } from 'next/router';
import ViewerVideoContainer from '../../../components/views/streaming/video-container/ViewerVideoContainer';
import { withFirebasePage } from '../../../data/firebase';
import NewCommentContainer from '../../../components/views/viewer/comment-container/NewCommentContainer';
import SmallViewerVideoDisplayer from '../../../components/views/streaming/video-container/SmallViewerVideoDisplayer';
import ViewerVideoDisplayer from '../../../components/views/streaming/video-container/ViewerVideoDisplayer';
import LivestreamPdfViewer from '../../../components/util/LivestreamPdfViewer';

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

    const [streamIds, setStreamIds] = useState([]);

    const [newQuestionTitle, setNewQuestionTitle] = useState("");

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
                <div className='video-box' style={{ height: currentLivestream.mode === 'presentation' ? '150px' : '100%' }}>
                    <Grid style={{ margin: 0, height: '100%' }} centered>
                        { videoElements }
                    </Grid>
                </div>
                <div style={{ display: (currentLivestream.mode === 'presentation' ? 'block' : 'none'), position: 'absolute', top: '150px', width: '100%', height: 'calc(100% - 235px)', backgroundColor: 'rgb(30,30,30)'}}>
                    <LivestreamPdfViewer livestreamId={currentLivestream.id} presenter={false}/>
                </div> 
            </div>  
            <div className='video-menu'>
                <div  className='video-menu-input'>
                        <Input action={{ content: 'Add a Question', color: 'teal', onClick: () => addNewQuestion() }} size='huge' maxLength='140' onKeyPress={addNewQuestionOnEnter} value={newQuestionTitle} fluid placeholder='Add your question...' onChange={(event) => {setNewQuestionTitle(event.target.value)}} />
                    </div>
                </div>  
            <div className='video-menu-left'>
                <NewCommentContainer livestream={ currentLivestream } userData={userData}  user={user}/>
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