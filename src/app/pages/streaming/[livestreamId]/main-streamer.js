import {useState, useEffect, useRef, Fragment} from 'react';
import {Container, Button, Grid, Header as SemanticHeader, Icon, Image, Input, Modal, Transition, Form} from "semantic-ui-react";

import { withFirebasePage } from '../../../data/firebase';
import ButtonWithConfirm from '../../../components/views/common/ButtonWithConfirm';
import axios from 'axios';

import Loader from '../../../components/views/loader/Loader';
import { useRouter } from 'next/router';
import useUserMedia from '../../../components/custom-hook/useDevices';
import useWebRTCAdaptor from '../../../components/custom-hook/useWebRTCAdaptor';
import { useWindowSize } from '../../../components/custom-hook/useWindowSize';
import LivestreamPdfViewer from '../../../components/util/LivestreamPdfViewer';
import StreamerVideoDisplayer from '../../../components/views/streaming/video-container/StreamerVideoDisplayer';
import SmallStreamerVideoDisplayer from '../../../components/views/streaming/video-container/SmallStreamerVideoDisplayer';
import NewCommentContainer from '../../../components/views/streaming/comment-container/NewCommentContainer';
import { Formik } from 'formik';
import { bool } from 'twilio/lib/base/serialize';
import Countdown from 'react-countdown';

function StreamingPage(props) {

    const router = useRouter();
    const livestreamId = router.query.livestreamId;

    const [streamerReady, setStreamerReady] = useState(false);
    const [currentLivestream, setCurrentLivestream] = useState(false);

    const [isStreaming, setIsStreaming] = useState(false);
    const [isCapturingDesktop, setIsCapturingDesktop] = useState(false);
    const [isLocalMicMuted, setIsLocalMicMuted] = useState(false);

    const devices = useUserMedia();

    const [streamId, setStreamId] = useState(null);
    const [mode, setMode] = useState('presentation');

    const [audioSource, setAudioSource] = useState(null);
    const [videoSource, setVideoSource] = useState(null);

    const [mediaConstraints, setMediaConstraints] = useState(null);
    const [numberOfViewers, setNumberOfViewers] = useState(0);

    const [showDisconnectionModal, setShowDisconnectionModal] = useState(false);
    const [showSpeakersModal, setShowSpeakersModal] = useState(false);

    const [additionalSpeakers, setAdditionalSpeakers] = useState(false);
    const [registeredSpeaker, setRegisteredSpeaker] = useState(false);

    const localVideoId = 'localVideo';

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
        onScreenShareStopped: (infoObj) => {
            setIsCapturingDesktop(false);
        },
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
        onScreenSharePermissionDenied: () => {
            setIsCapturingDesktop(false);
        },
    }

    const { webRTCAdaptor, externalMediaStreams } = 
        useWebRTCAdaptor(
            streamerReady,
            localVideoId,
            mediaConstraints,
            streamingCallbacks,
            errorCallbacks,
            livestreamId,
            livestreamId
        );

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
        if (livestreamId) {
            const unsubscribe = props.firebase.listenToLivestreamLiveSpeakers(livestreamId, querySnapshot => {
                let liveSpeakersList = [];
                querySnapshot.forEach(doc => {
                    let speaker = doc.data();
                    speaker.id = doc.id;
                    liveSpeakersList.push(speaker);
                });
                setAdditionalSpeakers(liveSpeakersList);
            });
            return () => unsubscribe();
        }
    }, [livestreamId]);

    useEffect(() => {
        if (livestreamId && Array.isArray(additionalSpeakers)) {
            if (!additionalSpeakers.some( speaker => speaker.id === (livestreamId))) {
                addASpeaker("Main Speaker", true);
            }
        } 
    }, [additionalSpeakers,livestreamId]);

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

    function toggleScreenSharing() {
        if (isCapturingDesktop) {
            webRTCAdaptor.switchVideoCapture(livestreamId);
        } else {
            webRTCAdaptor.switchDesktopCaptureWithCamera(livestreamId);
        }
        setIsCapturingDesktop(!isCapturingDesktop);
    }

    function toggleMicrophone() {
        if (isLocalMicMuted) {
            webRTCAdaptor.unmuteLocalMic();
        } else {
            webRTCAdaptor.muteLocalMic();
        }
        setIsLocalMicMuted(!isLocalMicMuted);
    }

    function addASpeaker(speakerName, main) {
        return props.firebase.createNewLivestreamSpeaker(livestreamId, speakerName, main);
    }

    function removeSpeaker(speakerId) {
        return props.firebase.deleteLivestreamSpeaker(livestreamId, speakerId);
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

    let speakerElements = [];

    if (additionalSpeakers && additionalSpeakers.length > 0) {
        speakerElements = additionalSpeakers.filter(speaker => speaker.id !== livestreamId).map((speaker, index) => {
            let link = 'https://careerfairy.io/streaming/' + livestreamId + '/joining-streamer/' + speaker.id;
            return (
                <div key={speaker.id} style={{ margin: '0 0 30px 0', border: '2px solid rgb(0, 210, 170)', padding: '20px', borderRadius: '10px', backgroundColor: 'rgb(252,252,252)', boxShadow: '0 0 2px grey' }} className='animated fadeIn'>
                    <h3 style={{ color: 'rgb(0, 210, 170)'}}><Icon name='user' style={{margin: '0 10px 0 0'}}/>{ speaker.name } <Button content={'Remove ' + speaker.name } icon='remove' size='mini' onClick={() => removeSpeaker(speaker.id)} style={{ margin: '0 20px'}}/></h3>
                    <Input type='text' value={link} disabled style={{ margin: '0 0 5px 0', color: 'red'}} fluid />
                    <p style={{ marginBottom: '10px', color: 'rgb(80,80,80)', fontSize: '0.8em'}}>Please send this link to { speaker.name } to allow her/him to join your live stream.</p>
                </div>
            )
        })
    }

    return (
        <div className='topLevelContainer'>
             <div className={'top-menu ' + (currentLivestream.hasStarted ? 'active' : '')}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                    <h3 style={{ color: (currentLivestream.hasStarted ?  'white' : 'orange') }}>{ currentLivestream.hasStarted ? 'YOU ARE NOW LIVE' : 'YOU ARE NOT LIVE'}</h3>
                    { currentLivestream.hasStarted ? '' : 'Press Start Streaming to begin'}
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
                    <SmallStreamerVideoDisplayer streams={externalMediaStreams} mainStreamerId={streamId} mediaConstraints={mediaConstraints} livestreamId={currentLivestream.id} presenter={true}/>
                </div>
                <div className='button-container'>         
                    <Grid centered className='middle aligned'>
                        <Grid.Column width={6} textAlign='center'>
                            <Countdown date={ currentLivestream.start ? currentLivestream.start.toDate() : null }/>
                            <ButtonWithConfirm
                                color='teal' 
                                size='big' 
                                buttonAction={currentLivestream.hasStarted ? stopStreaming : startStreaming} 
                                confirmDescription={currentLivestream.hasStarted ? 'Are you sure that you want to end your livestream now?' : 'Are you sure that you want to start your livestream now?'} 
                                buttonLabel={ currentLivestream.hasStarted ? 'Stop Streaming' : 'Start Streaming' }/>
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
                        {/* <Grid.Row style={{ margin: '10px 0'}}>
                            <Grid.Column textAlign='center'>
                                <div className='side-button' onClick={() => toggleScreenSharing()}style={{  color: isCapturingDesktop ? 'red' : 'white' }}>
                                    <Icon name='tv' size='large' style={{ margin: '0 0 5px 0' }}/>
                                    <p style={{ fontSize: '0.8em' }}>{ isCapturingDesktop ? 'Stop Screen Sharing' : 'Share Screen' }</p>
                                </div>
                            </Grid.Column>
                        </Grid.Row> */}
                        <Grid.Row style={{ margin: '10px 0'}}>
                            <Grid.Column textAlign='center'>
                                <div className='side-button' onClick={() => setShowSpeakersModal(true)}>
                                    <Icon name='user plus' size='large' style={{ margin: '0 0 5px 0', color: 'white'}}/>
                                    <p style={{ fontSize: '0.8em', color: 'white' }}>Invite Speakers</p>
                                </div>
                            </Grid.Column>
                        </Grid.Row>
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
                <Modal open={showSpeakersModal} onClose={() => setShowSpeakersModal(false)}>
                    <Modal.Header>Invite speakers</Modal.Header>
                    <Modal.Content>
                        <p style={{ fontSize: '0.9em', margin: '0 0 20px 0' }}>You can invite up to 3 speakers to join your stream. You should do this before starting your stream, to ensure that all streamer have joined before the event starts. When an invited speaker has successfully joined, you will be able to see and hear him/her in the stream overview.</p>
                        { speakerElements }
                        <div>
                            <Formik
                                initialValues={{ newSpeakerName: '' }}
                                validate={values => {
                                    let errors = {};
                                    if (!values.newSpeakerName) {
                                        errors.newSpeakerName = 'Please provide a name for the new speaker!';
                                    }
                                    return errors;
                                }}
                                onSubmit={(values, { setSubmitting, resetForm }) => {
                                    setSubmitting(true);
                                    addASpeaker(values.newSpeakerName, false)
                                    .then(() => {
                                        setSubmitting(false);
                                        resetForm({});
                                    }).catch(error => {
                                        setSubmitting(false);
                                        console.log(error);
                                    });
                                }}
                            >
                                {({
                                    values,
                                    errors,
                                    touched,
                                    handleChange,
                                    setFieldValue,
                                    handleBlur,
                                    handleSubmit,
                                    isSubmitting,
                                }) => (
                                    <Form onSubmit={handleSubmit} style={{ textAlign: 'left'}} size='big'>
                                        <Form.Field>
                                            <label style={{ fontSize: '0.9em', textTransform: 'uppercase', marginBottom: '5px' }}>Add a Speaker</label>
                                            <Input  type='text' name='newSpeakerName' action={{ type: 'submit', content: 'Add a Speaker', icon: 'add', primary: true }} value={values.newSpeakerName} onChange={handleChange} onBlur={handleBlur} fluid primary style={{ margin: '5px 0 0 0'}} disabled={isSubmitting || additionalSpeakers.length > 3} placeholder="Enter the name of the speaker you want to invite"/>
                                            <div className='field-error' style={{ color: 'red', fontSize: '0.8em', margin: '10px 0'}}>
                                                {errors.newSpeakerName && touched.newSpeakerName && errors.newSpeakerName}
                                            </div>
                                        </Form.Field>
                                    </Form>
                                    )}
                            </Formik>
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
                    min-width: 700px;
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