import {useState, useEffect, useRef} from 'react';
import {Container, Button, Grid, Header as SemanticHeader, Icon, Image, Input, Modal, Transition, Dropdown} from "semantic-ui-react";

import { withFirebasePage } from '../../../../data/firebase';
import axios from 'axios';

import { useRouter } from 'next/router';
import useUserMedia from '../../../../components/custom-hook/useDevices';
import useWebRTCAdaptor from '../../../../components/custom-hook/useWebRTCAdaptor';
import StreamerVideoDisplayer from '../../../../components/views/streaming/video-container/StreamerVideoDisplayer';
import NewCommentContainer from '../../../../components/views/streaming/comment-container/NewCommentContainer';
import SmallStreamerVideoDisplayer from '../../../../components/views/streaming/video-container/SmallStreamerVideoDisplayer';

function StreamingPage(props) {

    const router = useRouter();
    const livestreamId = router.query.livestreamId;
    const streamerId = router.query.streamerId;

    const [isStreaming, setIsStreaming] = useState(false);
    const [isLocalMicMuted, setIsLocalMicMuted] = useState(false);

    const [currentLivestream, setCurrentLivestream] = useState(false);

    const [showDisconnectionModal, setShowDisconnectionModal] = useState(false);
    const [registeredSpeaker, setRegisteredSpeaker] = useState(false);

    const [streamId, setStreamId] = useState(null);

    const devices = useUserMedia();

    const [audioSource, setAudioSource] = useState(null);
    const [videoSource, setVideoSource] = useState(null);

    const [mediaConstraints, setMediaConstraints] = useState(null);
    const [numberOfViewers, setNumberOfViewers] = useState(0);

    const localVideoId = 'localVideo';

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
    }

    const { webRTCAdaptor, externalMediaStreams } = useWebRTCAdaptor(
        localVideoId,
        mediaConstraints,
        streamingCallbacks,
        errorCallbacks,
        livestreamId,
        streamerId
    );

    useEffect(() => {
        debugger;
        if (isStreaming) {
            setLiveSpeakerConnected();
        } else {
            setLiveSpeakerDisconnected();
        }
    },[isStreaming, registeredSpeaker.id]);

    useEffect(() => {
        if (!audioSource && devices.audioInputList && devices.audioInputList.length > 0) {
            setAudioSource(devices.audioInputList[0].value);
        }
        if (!videoSource && devices.videoDeviceList && devices.videoDeviceList.length > 0) {
            setVideoSource(devices.videoDeviceList[0].value);
        }
    },[devices]);

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
                setRegisteredSpeaker(currentSpeaker);
            });
            return () => unsubscribe();
        }
    }, [streamerId]);

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
                        url: 'https://us-central1-careerfairy-e1fd9.cloudfunctions.net/getNumberOfViewers?livestreamId=' + streamId,
                    }).then( response => { 
                            setNumberOfViewers(response.data.totalWebRTCWatchersCount > -1 ? response.data.totalWebRTCWatchersCount : 0);
                        }).catch(error => {
                            console.log(error);
                    });
                }, 10000);
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
        if (registeredSpeaker) {
            props.firebase.setLivestreamLiveSpeakersConnected(livestreamId, registeredSpeaker);
        }
    }

    function setLiveSpeakerDisconnected() {
        if (registeredSpeaker) {
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

    return (
        <div className='topLevelContainer'>
             <div className={'top-menu ' + (isStreaming ? 'active' : '')}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                    <h3 style={{ color: (isStreaming ?  'white' : 'orange') }}>{ isStreaming ? 'YOU ARE NOW LIVE' : 'YOU ARE NOT LIVE'}</h3>
                    { isStreaming ? '' : 'The Stream will begin when the host presses Start Streaming'}
                </div>
                <div style={{ float: 'right', display: 'inlineBlock', margin: '0 20px', fontSize: '1.2em', fontWeight: '700', padding: '10px' }}>
                    Viewers: { numberOfViewers }
                </div>
            </div>
            <div className='black-frame'>
                <div style={{ display: (currentLivestream.mode === 'default' ? 'block' : 'none')}}>
                    <StreamerVideoDisplayer streams={externalMediaStreams} mainStreamerId={streamId} mediaConstraints={mediaConstraints}/>
                </div>
                <div style={{ display: (currentLivestream.mode === 'presentation' ? 'block' : 'none')}}>
                    <SmallStreamerVideoDisplayer streams={externalMediaStreams} mainStreamerId={streamId} mediaConstraints={mediaConstraints} livestreamId={currentLivestream.id} presenter={false}/>
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
                    left: 120px;
                    bottom: 0;
                    width: calc(100% - 120px);
                    height: 90px;
                    cursor:  pointer;
                    padding: 17px;
                    z-index: 8000;
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