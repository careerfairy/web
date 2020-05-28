import {useState, useEffect, useRef} from 'react';
import {Container, Button, Grid, Header as SemanticHeader, Icon, Image, Input, Modal, Transition, Dropdown} from "semantic-ui-react";

import { withFirebasePage } from '../../../../data/firebase';
import axios from 'axios';

import { useRouter } from 'next/router';
import useUserMedia from '../../../../components/custom-hook/useDevices';
import useWebRTCAdaptor from '../../../../components/custom-hook/useWebRTCAdaptor';
import CurrentSpeakerDisplayer from '../../../../components/views/streaming/video-container/CurrentSpeakerDisplayer';
import NewCommentContainer from '../../../../components/views/streaming/comment-container/NewCommentContainer';
import SmallStreamerVideoDisplayer from '../../../../components/views/streaming/video-container/SmallStreamerVideoDisplayer';
import CountdownTimer from '../../../../components/views/common/Countdown';

function StreamingPage(props) {

    const router = useRouter();
    const livestreamId = router.query.livestreamId;
    const streamerId = router.query.streamerId;

    const [streamerReady, setStreamerReady] = useState(false);
    const [connectionEstablished, setConnectionEstablished] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const [isStreaming, setIsStreaming] = useState(false);
    const [isLocalMicMuted, setIsLocalMicMuted] = useState(false);

    const [currentLivestream, setCurrentLivestream] = useState(false);

    const [showDisconnectionModal, setShowDisconnectionModal] = useState(false);
    const [registeredSpeaker, setRegisteredSpeaker] = useState({ id: null });

    const [streamId, setStreamId] = useState(null);
    const [streamStartTimeIsNow, setStreamStartTimeIsNow] = useState(false);


    const devices = useUserMedia();

    const [audioSource, setAudioSource] = useState(null);
    const [videoSource, setVideoSource] = useState(null);

    const [mediaConstraints, setMediaConstraints] = useState(null);
    const [numberOfViewers, setNumberOfViewers] = useState(0);

    const [speakingLivestreamId, setSpeakingLivestreamId] = useState(null);

    const localVideoId = 'localVideo';
    const isPlayMode = false;

    let streamingCallbacks = {
        onInitialized: () => {},
        onJoinedRoom: (infoObj) => {},
        onStreamJoined: (infoObj) => {},
        onStreamLeaved: (infoObj) => {},
        onNewStreamAvailable: (infoObj) => {},
        onPublishStarted: (infoObj) => {
            setIsStreaming(true);
        },
        onPublishFinished: (infoObj) => {
            setIsStreaming(false);
        },
        onScreenShareStopped: (infoObj) => {
            setIsCapturingDesktop(false);
        },
        onClosed: (infoObj) => {
            setIsInitialized(false);
        },
        onDisconnected: (infoObj) => {
            setShowDisconnectionModal(true);
        },
        onConnected: (infoObj) => {
            setShowDisconnectionModal(false);
        },
        onUpdatedStats: (infoObj) => {},
    }

    let errorCallbacks = {
        onScreenSharePermissionDenied: () => {
            setIsCapturingDesktop(false);
        },
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
            streamerId
        );

    useEffect(() => {
        if (audioLevels && audioLevels.length > 0) {
            const maxEntry = audioLevels.reduce((prev, current) => (prev.audioLevel > current.audioLevel) ? prev : current);
            setSpeakingLivestreamId(maxEntry.streamId);
        }
    }, [audioLevels]);

    useEffect(() => {
        if (!audioSource && devices.audioInputList && devices.audioInputList.length > 0) {
            setAudioSource(devices.audioInputList[0].value);
        }
        if (!videoSource && devices.videoDeviceList && devices.videoDeviceList.length > 0) {
            setVideoSource(devices.videoDeviceList[0].value);
        }
    },[devices]);

    useEffect(() => {
        if (isStreaming) {
            setLiveSpeakerConnected();
        } else {
            setLiveSpeakerDisconnected();
        }
    },[isStreaming, registeredSpeaker.id]);

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
        if (streamerId) {
            const unsubscribe = props.firebase.listenToLivestreamLiveSpeakers(livestreamId, querySnapshot => {
                let currentSpeaker = null;
                querySnapshot.forEach(doc => {
                    if (streamerId === doc.id) {
                        currentSpeaker = doc.data();
                        currentSpeaker.id = doc.id;
                    }
                });
                if (currentSpeaker) {
                    setRegisteredSpeaker(currentSpeaker);
                }
            });
            return () => unsubscribe();
        }
    }, [streamerId]);
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
            audio: {deviceId: audioSource ? {exact: audioSource} : undefined },
            video: { 
                width: { ideal: 1920, max: 1920 },
                height: { ideal: 1080, max: 1080 },
                aspectRatio: 1.77,
                deviceId: videoSource ? {exact: videoSource} : undefined
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
                        url: 'https://us-central1-careerfairy-e1fd9.cloudfunctions.net/getNumberOfViewers?livestreamId=' + streamerId,
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
        if (currentLivestream.hasStarted) {
            setIsStreaming(true);
        } else {
            setIsStreaming(false);
            setNumberOfViewers(0);
        }
    }, [currentLivestream.hasStarted]);

    function setLiveSpeakerConnected() {
        if (registeredSpeaker && registeredSpeaker.id) {
            props.firebase.setLivestreamLiveSpeakersConnected(livestreamId, registeredSpeaker);
        }
    }

    function setLiveSpeakerDisconnected() {
        if (registeredSpeaker && registeredSpeaker.id) {
            props.firebase.setLivestreamLiveSpeakersDisconnected(livestreamId, registeredSpeaker.id);
        }
    }
 
    function toggleMicrophone() {
        if (isLocalMicMuted) {
            webRTCAdaptor.unmuteLocalMic();
        } else {
            webRTCAdaptor.muteLocalMic();
        }
        setIsLocalMicMuted(!isLocalMicMuted);
    }

    function dateIsInUnder2Minutes(date) {
        return new Date(date).getTime() - Date.now() < 1000*60*2 || Date.now() > new Date(date).getTime();
    }

    return (
        <div className='topLevelContainer'>
             <div className={'top-menu ' + (currentLivestream.hasStarted ? 'active' : '')}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                    <h3 style={{ color: (currentLivestream.hasStarted ?  'white' : 'orange') }}>{ currentLivestream.hasStarted ? 'YOU ARE NOW LIVE' : 'YOU ARE NOT LIVE'}</h3>
                    { currentLivestream.hasStarted ? '' : 'The Stream will begin when the host presses Start Streaming'}
                </div>
                <div style={{ float: 'right', display: 'inlineBlock', margin: '0 20px', fontSize: '1.2em', fontWeight: '700', padding: '10px' }}>
                    Viewers: { numberOfViewers }
                </div>
            </div>
            <div className='black-frame'>
                <div style={{ display: (currentLivestream.mode === 'default' ? 'block' : 'none')}}>
                    <CurrentSpeakerDisplayer isPlayMode={false} localId={streamerId} streams={externalMediaStreams} mediaConstraints={mediaConstraints} currentSpeaker={speakingLivestreamId}/>
                </div>
                <div style={{ display: (currentLivestream.mode === 'presentation' ? 'block' : 'none')}}>
                    <SmallStreamerVideoDisplayer streams={externalMediaStreams} mainStreamerId={streamId} mediaConstraints={mediaConstraints} livestreamId={currentLivestream.id} presenter={false}/>
                </div>
                <div className='button-container'>         
                 <Grid centered className='middle aligned'>
                        <Grid.Column width={10} textAlign='center'>
                            <div className='countdown' style={{ display: (currentLivestream.hasStarted || !currentLivestream.start) ? 'none' : 'block', backgroundColor: streamStartTimeIsNow ? 'rgba(0, 210, 170, 0.8)' : 'rgba(0,0,0,0.8)'}}>
                                <div>Your livestream is scheduled to start in</div>
                                <CountdownTimer date={ currentLivestream.start ? currentLivestream.start.toDate() : null }><span>The host should press "Start Streaming" to start the event</span></CountdownTimer>
                            </div>
                        </Grid.Column>
                    </Grid>
                </div>
            </div>            <div className='video-menu-left'>
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
                        {/* <Grid.Row style={{ margin: '10px 0'}}>
                            <Grid.Column textAlign='center'>
                                <div className='side-button' onClick={() => alert("blob")}>
                                    <Icon name='clone outline' size='large' style={{ margin: '0 0 5px 0', color: 'white'}}/>
                                    <p style={{ fontSize: '0.8em', color: 'white' }}>Share Slides</p>
                                </div>
                            </Grid.Column>
                        </Grid.Row> */}
                        {/* <Grid.Row style={{ margin: '10px 0'}}>
                            <Grid.Column textAlign='center'>
                                <div className='side-button' onClick={() => toggleScreenSharing()}style={{  color: isCapturingDesktop ? 'red' : 'white' }}>
                                    <Icon name='tv' size='large' style={{ margin: '0 0 5px 0' }}/>
                                    <p style={{ fontSize: '0.8em' }}>{ isCapturingDesktop ? 'Stop Screen Sharing' : 'Share Screen' }</p>
                                </div>
                            </Grid.Column>
                        </Grid.Row> */}
                        {/* <Grid.Row style={{ margin: '10px 0'}}>
                            <Grid.Column textAlign='center'>
                                <div className='side-button' onClick={() => alert("blob")}>
                                    <Icon name='user plus' size='large' style={{ margin: '0 0 5px 0', color: 'white'}}/>
                                    <p style={{ fontSize: '0.8em', color: 'white' }}>Invite Speaker</p>
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
                <Modal open={!registeredSpeaker}>
                    <Modal.Header>You are not registered</Modal.Header>
                    <Modal.Content>
                        <p>The link you used to connect to this stream is invalid. Please contact the stream's host to get a valid link.</p>
                        <Button content='Reload' primary/>
                    </Modal.Content>
                </Modal>
                <Modal open={!streamerReady}>
                    <Modal.Header><h3 style={{ color: 'rgb(0, 210, 170)'}}>CareerFairy Streaming</h3></Modal.Header>
                    <Modal.Content>
                        <h3>Preparation</h3>
                        <p>Please follow these couple of instructions to ensure a smooth streaming experience:</p>
                        <ul className='list'>
                            <li><Icon name='chrome'/>Use the latest Google Chrome desktop browser (v. 80 and newer).</li>
                            <li><Icon name='video'/>Make sure that your browser is authorized to access your webcam and microphone.</li>
                            <li><Icon name='microphone'/>Make sure that your webcam and/or microphone are not currently used by any other application.</li>
                            <li><Icon name='wifi'/>If possible, avoid connecting through any VPN or corporate network with restrictive firewall rules.</li>
                        </ul>
                        <Button content='I got it!' primary fluid style={{ margin: '40px 0 10px 0'}} onClick={() => setStreamerReady(true) }/>
                        <p>If anything is unclear or not working, please <a href='mailto:thomas@careerfairy.io'>contact us</a>!</p>
                    </Modal.Content>
                </Modal>
                <Modal open={streamerReady && !connectionEstablished} style={{ textAlign: 'center', padding: '40px' }}>
                    <Modal.Content>
                        <div style={{ display: (streamerReady && !isStreaming && !errorMessage) ? 'block' : 'none' }}>
                            <Image src='/loader.gif' style={{ width: '50px', height: 'auto', margin: '0 auto' }} />
                            <div>Attempting to connect...</div>
                        </div>
                        <div  style={{ display: isStreaming ? 'block' : 'none' }}>
                            <Icon name='check circle outline' style={{ color: 'rgb(0, 210, 170)', fontSize: '3em', margin: '0 auto' }} />
                            <h3>You are ready to stream!</h3>
                            <div>Your stream will go live once the host presses "Start Streaming".</div>
                            <Button content='Continue' style={{ marginTop: '20px'}} primary onClick={() => setConnectionEstablished(true)}/>
                        </div>
                        <div style={{ display: errorMessage ? 'block' : 'none' }}>
                            <Icon name='frown outline' style={{ color: 'rgb(240, 30, 0)', fontSize: '3em', margin: '0 auto' }} />
                            <h3>An error occured with the following message:</h3>
                            <div>{ errorMessage }</div>
                            <Button content='Try again' style={{ marginTop: '20px'}} primary onClick={() => {  window.location.reload(false) }}/>
                        </div>
                    </Modal.Content>
                </Modal>
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
                    width: 330px;
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
                    left: 330px;
                    right: 120px;
                    width: calc(100% - 450px);
                    min-width: 700px;
                    height: calc(100% - 75px);
                    min-height: 600px;
                    z-index: 10;
                    background-color: black;
                    cursor: pointer;
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
                    background-color: rgba(0,0,0,0.85);
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

export default withFirebasePage(StreamingPage);