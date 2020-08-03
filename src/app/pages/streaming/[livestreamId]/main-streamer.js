import {useState, useEffect} from 'react';
import {Button, Grid, Icon, Input, Modal} from "semantic-ui-react";

import { withFirebasePage } from '../../../data/firebase';
import ButtonWithConfirm from '../../../components/views/common/ButtonWithConfirm';
import axios from 'axios';

import { useRouter } from 'next/router';
import useWebRTCAdaptor from '../../../components/custom-hook/useWebRTCAdaptor';
import { useWindowSize } from '../../../components/custom-hook/useWindowSize';
import LivestreamPdfViewer from '../../../components/util/LivestreamPdfViewer';
import CurrentSpeakerDisplayer from '../../../components/views/streaming/video-container/CurrentSpeakerDisplayer';
import StreamerVideoDisplayer from '../../../components/views/streaming/video-container/StreamerVideoDisplayer';
import SmallStreamerVideoDisplayer from '../../../components/views/streaming/video-container/SmallStreamerVideoDisplayer';
import NewCommentContainer from '../../../components/views/streaming/comment-container/NewCommentContainer';
import CountdownTimer from '../../../components/views/common/Countdown';
import SpeakerManagementModal from '../../../components/views/streaming/modal/SpeakerManagementModal';
import StreamPreparationModal from '../../../components/views/streaming/modal/StreamPreparationModal';
import { useLocalStream } from '../../../components/custom-hook/useLocalStream';

function StreamingPage(props) {

    const router = useRouter();
    const livestreamId = router.query.livestreamId;

    const [streamerReady, setStreamerReady] = useState(false);
    const [connectionEstablished, setConnectionEstablished] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const [currentLivestream, setCurrentLivestream] = useState(false);

    const [isStreaming, setIsStreaming] = useState(false);
    const [isLocalMicMuted, setIsLocalMicMuted] = useState(false);

    const [streamStartTimeIsNow, setStreamStartTimeIsNow] = useState(false);

    const [audioSource, setAudioSource] = useState(null);
    const [videoSource, setVideoSource] = useState(null);

    const [mediaConstraints, setMediaConstraints] = useState(null);
    const { permissionGranted, userMediaError, localStream } = useLocalStream(mediaConstraints);

    const [numberOfViewers, setNumberOfViewers] = useState(0);

    const [showDisconnectionModal, setShowDisconnectionModal] = useState(false);
    const [showSpeakersModal, setShowSpeakersModal] = useState(false);

    const [registeredSpeaker, setRegisteredSpeaker] = useState(false);

    const localVideoId = 'localVideo';
    const  isPlayMode = false;

    let streamingCallbacks = {
        onInitialized: (infoObj) => {},
        onPublishStarted: (infoObj) => {
            setMainStreamIdToStreamerList(infoObj.streamId);
            setShowDisconnectionModal(false);
            setIsStreaming(true);
        },
        onJoinedTheRoom: (infoObj) => {
        },
        onNewStreamAvailable: (infoObj) => {
            addStreamIdToStreamerList(infoObj.streamId);
        },
        onStreamLeaved: (infoObj) => {
            removeStreamIdFromStreamerList(infoObj.streamId);
            setLiveSpeakerDisconnected(infoObj.streamId);
        },
        onPublishFinished: (infoObj) => {
            setIsStreaming(false);
        },
        onScreenShareStopped: (infoObj) => {},
        onDisconnected: (infoObj) => {
            setShowDisconnectionModal(true);
        },
        onConnected: (infoObj) => {
            setShowDisconnectionModal(false);
        },
        onClosed: (infoObj) => {},
        onUpdatedStats: (infoObj) => {},
    }

    let errorCallbacks = {
        onScreenSharePermissionDenied: () => {},
        onOtherError: (error) => {
            if (typeof error === "string") {
                setErrorMessage(error);
            } else {
                setErrorMessage("A connection error occured");
            }
        }
    }

    const { webRTCAdaptor, externalMediaStreams, audioLevels } = 
        useWebRTCAdaptor(
            streamerReady,
            isPlayMode,
            localVideoId,
            mediaConstraints,
            streamingCallbacks,
            errorCallbacks,
            livestreamId,
            livestreamId
        );
    useEffect(() => {
        if (currentLivestream.speakerSwitchMode === 'automatic') {
            if (audioLevels && audioLevels.length > 0) {
                const maxEntry = audioLevels.reduce((prev, current) => (prev.audioLevel > current.audioLevel) ? prev : current);
                setLivestreamCurrentSpeakerId(maxEntry.streamId);
            }
        } else {
            if (currentLivestream) {
                setLivestreamCurrentSpeakerId(currentLivestream.currentSpeakerId);
            }
        }
        
    }, [audioLevels]);

    useEffect(() => {
        if (isStreaming) {
            setLiveSpeakerConnected(registeredSpeaker);
        } else {
            setLiveSpeakerDisconnected(registeredSpeaker.id);
        }
    },[isStreaming]);

    useEffect(() => {
        if (livestreamId) {
            props.firebase.listenToScheduledLivestreamById(livestreamId, querySnapshot => {
                if (!querySnapshot.isEmpty) {
                    let livestream = querySnapshot.data();
                    livestream.id = querySnapshot.id;
                    setCurrentLivestream(livestream);
                }   
            });
        }
    }, [livestreamId]);

    useEffect(() => {
        if (currentLivestream.start) {
            let interval = setInterval(() => {
                if (dateIsInUnder2Minutes(currentLivestream.start.toDate())) {
                    setStreamStartTimeIsNow(true);
                    clearInterval(interval);
                }
            }, 1000)
        }
    }, [currentLivestream.start]);

    useEffect(() => {
        const constraints = {
            audio: {deviceId: audioSource ? audioSource : undefined },
            video: { 
                width: { ideal: 1920, max: 1920 },
                height: { ideal: 1080, max: 1080 },
                aspectRatio: 1.77,   
                deviceId: videoSource ? videoSource : undefined
            }
          };
        setMediaConstraints(constraints);
    },[audioSource, videoSource]);

    useEffect(() => {
        if (currentLivestream && currentLivestream.id) {     
            clearInterval();
            if (currentLivestream.hasStarted) {
                setInterval(() => {
                    axios({
                        method: 'get',
                        url: 'https://us-central1-careerfairy-e1fd9.cloudfunctions.net/getNumberOfViewers?livestreamId=' + livestreamId,
                    }).then( response => { 
                            if (response.data.totalWebRTCWatchersCount > -1) {
                                setNumberOfViewers(response.data.totalWebRTCWatchersCount);
                            }
                        }).catch(error => {
                            console.log(error);
                    });
                }, 10000);
            } else {
                setNumberOfViewers(0);
            }
        }
    }, [currentLivestream, currentLivestream.hasStarted]);

    useEffect(() => {
        if (livestreamId) {
            const unsubscribe = props.firebase.listenToLivestreamLiveSpeakers(livestreamId, querySnapshot => {
                let currentSpeaker = null;
                querySnapshot.forEach(doc => {
                    if (livestreamId === doc.id) {
                        currentSpeaker = doc.data();
                        currentSpeaker.id = doc.id;
                    }
                });
                setRegisteredSpeaker(currentSpeaker);
            });
            return () => unsubscribe();
        }
    }, [livestreamId]);

    function startStreaming() {
        props.firebase.setLivestreamHasStarted(true, currentLivestream.id);
    }

    function stopStreaming() {
        props.firebase.setLivestreamHasStarted(false, currentLivestream.id);
    }

    function setMainStreamIdToStreamerList(streamId) {
        props.firebase.setMainStreamIdToLivestreamStreamers(livestreamId, streamId);
    }

    function addStreamIdToStreamerList(streamId) {
        props.firebase.addStreamIdToLivestreamStreamers(livestreamId, streamId);
    }

    function removeStreamIdFromStreamerList(streamId) {
        props.firebase.removeStreamIdFromLivestreamStreamers(livestreamId, streamId);
    }

    function setLivestreamMode(mode) {
        props.firebase.setLivestreamMode(livestreamId, mode);
    }

    function setLivestreamSpeakerSwitchMode(mode) {
        props.firebase.setLivestreamSpeakerSwitchMode(livestreamId, mode);
    }

    function setLivestreamCurrentSpeakerId(id) {
        props.firebase.setLivestreamCurrentSpeakerId(livestreamId, id);
    }

    function toggleMicrophone() {
        if (isLocalMicMuted) {
            webRTCAdaptor.unmuteLocalMic();
        } else {
            webRTCAdaptor.muteLocalMic();
        }
        setIsLocalMicMuted(!isLocalMicMuted);
    }

    function setLiveSpeakerConnected(speaker) {
        if (registeredSpeaker) {
            props.firebase.setLivestreamLiveSpeakersConnected(livestreamId, speaker);
        }
    }

    function setLiveSpeakerDisconnected(speakerId) {
        if (registeredSpeaker) {
            props.firebase.setLivestreamLiveSpeakersDisconnected(livestreamId, speakerId);
        }
    }

    function dateIsInUnder2Minutes(date) {
        return new Date(date).getTime() - Date.now() < 1000*60*2 || Date.now() > new Date(date).getTime();
    }

    return (
        <div className='topLevelContainer'>
             <div className={'top-menu ' + (currentLivestream.hasStarted ? 'active' : '')}>
                <div style={{ position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)', verticalAlign: 'middle'}}>
                    <ButtonWithConfirm
                        color={currentLivestream.hasStarted ? 'red' : 'teal'} 
                        size='big' 
                        fluid
                        disabled={!streamStartTimeIsNow}
                        buttonAction={currentLivestream.hasStarted ? stopStreaming : startStreaming} 
                        confirmDescription={currentLivestream.hasStarted ? 'Are you sure that you want to end your livestream now?' : 'Are you sure that you want to start your livestream now?'} 
                        buttonLabel={ currentLivestream.hasStarted ? 'Stop Streaming' : 'Start Streaming' }/>
                </div>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'inline-block', padding: '10px', verticalAlign: 'middle'}}>
                    <h3 style={{ color: (currentLivestream.hasStarted ?  'white' : 'orange') }}>{ currentLivestream.hasStarted ? 'YOU ARE NOW LIVE' : 'YOU ARE NOT LIVE'}</h3>
                    { currentLivestream.hasStarted ? '' : 'Press Start Streaming to begin'}
                </div>
                <div style={{ float: 'right', margin: '0 20px', fontSize: '1.2em', fontWeight: '700', padding: '10px', verticalAlign: 'middle'}}>
                    Viewers: { numberOfViewers }
                </div>
            </div>
            <div className='black-frame'>
                <div style={{ display: (currentLivestream.mode === 'default' ? 'block' : 'none')}}>
                    <CurrentSpeakerDisplayer isPlayMode={false} speakerSwitchModeActive={currentLivestream.speakerSwitchMode === "manual"} setLivestreamCurrentSpeakerId={setLivestreamCurrentSpeakerId} localId={livestreamId} localStream={localStream} streams={externalMediaStreams} mediaConstraints={mediaConstraints} currentSpeaker={currentLivestream.currentSpeakerId} muted={false}/>
                </div>
                <div style={{ display: (currentLivestream.mode === 'presentation' ? 'block' : 'none')}}>
                    <SmallStreamerVideoDisplayer isPlayMode={false} localStream={localStream} streams={externalMediaStreams} mediaConstraints={mediaConstraints} livestreamId={currentLivestream.id} presenter={true}/>
                </div>
                <div className='button-container'>         
                    <Grid centered className='middle aligned'>
                        <Grid.Column width={10} textAlign='center'>
                            <div className='countdown' style={{ display: (currentLivestream.hasStarted || !currentLivestream.start) ? 'none' : 'block', backgroundColor: streamStartTimeIsNow ? 'rgba(0, 210, 170, 0.8)' : 'rgba(0,0,0,0.8)'}}>
                                <div>Your livestream is scheduled to start in</div>
                                <CountdownTimer date={ currentLivestream.start ? currentLivestream.start.toDate() : null }><span>Press Start Streaming to start the event</span></CountdownTimer>
                            </div>
                        </Grid.Column>
                    </Grid>
                </div>
            </div>
            <div className='video-menu-left'>
                <NewCommentContainer livestream={ currentLivestream }/>
            </div>
            <div className='right-container'>
                    <Grid columns={1}>
                        <Grid.Row style={{ margin: '10px 0'}}>
                            <Grid.Column textAlign='center'>
                                <div className='side-button' onClick={() => toggleMicrophone()} style={{  color: isLocalMicMuted ? 'red' : 'white' }}>
                                    <Icon name='microphone slash' size='large' style={{ margin: '0 0 5px 0'}}/>
                                    <p style={{ fontSize: '0.8em' }}>{ isLocalMicMuted ? 'Unmute' : 'Mute' }</p>
                                </div>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row style={{ margin: '10px 0'}}>
                            <Grid.Column textAlign='center'>
                                <div className='side-button' onClick={() => setLivestreamMode(currentLivestream.mode === "default" ? "presentation" : "default")}  style={{  color: currentLivestream.mode === "presentation" ? 'red' : 'white' }}>
                                    <Icon name='clone outline' size='large' style={{ margin: '0 0 5px 0', color: currentLivestream.mode === "presentation" ? 'red' : 'white'}}/>
                                    <p style={{ fontSize: '0.8em', color: currentLivestream.mode === "presentation" ? 'red' : 'white' }}>{ currentLivestream.mode === "presentation" ? 'Stop Sharing Slides' : 'Share Slides' }</p>
                                </div>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row style={{ margin: '10px 0'}}>
                            <Grid.Column textAlign='center'>
                                <div className='side-button' onClick={() => setLivestreamSpeakerSwitchMode(currentLivestream.speakerSwitchMode === "automatic" ? "manual" : "automatic")} style={{  color: currentLivestream.speakerSwitchMode === "automatic" ? 'red' : 'white' }}>
                                    <Icon name='assistive listening systems' size='large' style={{ margin: '0 0 5px 0' }}/>
                                    <p style={{ fontSize: '0.8em' }}>{ currentLivestream.speakerSwitchMode === "automatic" ? 'Automatic Speaker Switch' : 'Manual Speaker Switch' }</p>
                                </div>
                            </Grid.Column>
                        </Grid.Row>
                        {/* <Grid.Row style={{ margin: '10px 0'}}>
                            <Grid.Column textAlign='center'>
                                <div className='side-button' onClick={() => setShowSpeakersModal(true)}>
                                    <Icon name='user plus' size='large' style={{ margin: '0 0 5px 0', color: 'white'}}/>
                                    <p style={{ fontSize: '0.8em', color: 'white' }}>Invite Speakers</p>
                                </div>
                            </Grid.Column>
                        </Grid.Row> */}
                        {/* <Grid.Row style={{ margin: '10px 0'}}>
                            <Grid.Column textAlign='center'>
                                <div className='side-button' onClick={() => alert("blob")}>
                                    <Icon name='cog' size='large' style={{ margin: '0 0 5px 0', color: 'white'}}/>
                                    <p style={{ fontSize: '0.8em', color: 'white' }}>Settings</p>
                                </div>
                            </Grid.Column>
                        </Grid.Row> */}
                    </Grid>
                </div>
                <Modal open={showDisconnectionModal}>
                    <Modal.Header>You have been disconnected</Modal.Header>
                    <Modal.Content>
                        <p>No need to panic! To rejoin the stream, simply check your internet connection and reload this page.</p>
                        <Button content='Reload' primary/>
                    </Modal.Content>
                </Modal>
                <SpeakerManagementModal livestreamId={livestreamId} open={showSpeakersModal} setOpen={setShowSpeakersModal}/>
                <StreamPreparationModal streamerReady={streamerReady} setStreamerReady={setStreamerReady} localStream={localStream} mediaConstraints={mediaConstraints} connectionEstablished={connectionEstablished} setConnectionEstablished={setConnectionEstablished} errorMessage={errorMessage} isStreaming={isStreaming} audioSource={audioSource} setAudioSource={setAudioSource} videoSource={videoSource} setVideoSource={setVideoSource}/>
            <style jsx>{`
                .hidden {
                    display: none
                }
                
                .top-menu {
                    position: relative;
                    background-color: rgba(245,245,245,1);
                    padding: 15px 0;
                    height: 75px;
                    text-align: center;
                }

                .list li {
                    margin: 5px 0;
                }

                .list li i {
                    color: rgb(0, 210, 170);
                }

                .top-menu.active {
                    background-color: rgba(0, 210, 170, 1);
                    color: white;
                }

                .top-menu h3 {
                    font-weight: 600;
                }

                .remoteVideoContainer {
                    position: absolute;
                    top: 20px;
                    left: 50%;
                    transform: translate(-50%);
                    width: 80%;
                    height: 200px;
                }

                .pdfContent {
                    width: 100%;
                }

                .video-container {
                    position: relative;
                    background-color: black;
                    width: 100%;
                    margin: 0 auto;
                    z-index: -9999;
                }

                #localVideo {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    max-height: 100%;
                    max-width: 100%;
                    height: auto;
                    z-index: 9900;
                    background-color: black;
                }

                .video-menu-left {
                    position: absolute;
                    top: 75px;
                    left: 0;
                    bottom: 0;
                    width: 280px;
                    z-index: 1;
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
                    left: 280px;
                    right: 120px;
                    width: calc(100% - 400px);
                    min-width: 400px;
                    height: calc(100% - 75px);
                    min-height: 600px;
                    z-index: 10;
                    background-color: black;
                }

                .video-container {
                    width: 100%;
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background-color: black;
                }

                .video-container-small {
                    width: 300px;
                    padding-top: 15%;
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background-color: black;
                }

                .button-container {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;                    
                    cursor:  pointer;
                    padding: 17px;
                    z-index: 8000;
                }

                .countdown {
                    margin: 0 0 20px 0;
                    color: white;
                    padding: 20px 0;
                    border-radius: 10px;
                    font-size: 1.2em;
                    background-color: rgba(0,0,0,0.8);
                    min-height: 100px;
                }

                .countdown .label {
                    color: white;
                }

                .right-container {
                    position: absolute;
                    right: 0;
                    top: 75px;
                    height: calc(100% - 75px);
                    width: 120px;
                    padding: 20px;
                    background-color: rgb(80,80,80);
                }

                .logo-container {
                    position: absolute;
                    bottom: 90px;
                    left: 120px;
                    right: 0;
                    color: rgb(0, 210, 170);
                    font-size: 1.4em;
                    text-align: center;
                }
            `}</style>
        </div>
    );
}

export default withFirebasePage(StreamingPage);