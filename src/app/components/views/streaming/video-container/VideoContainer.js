import {useState, useEffect, Fragment} from 'react';
import {Button, Grid, Icon, Input, Modal} from "semantic-ui-react";

import { withFirebasePage } from 'data/firebase';

import CountdownTimer from 'components/views/common/Countdown';
import { useLocalStream } from 'components/custom-hook/useLocalStream';
import useWebRTCAdaptor from 'components/custom-hook/useWebRTCAdaptor';
import CurrentSpeakerDisplayer from './CurrentSpeakerDisplayer';
import SmallStreamerVideoDisplayer from './SmallStreamerVideoDisplayer';
import StreamPreparationModal from 'components/views/streaming/modal/StreamPreparationModal';

function VideoContainer(props) {

    const [errorMessage, setErrorMessage] = useState(null);
    const [showLivestreamCountdown, setShowLivestreamCountdown] = useState(true);
    
    const [streamerReady, setStreamerReady] = useState(false);
    const [connectionEstablished, setConnectionEstablished] = useState(false);

    const [isStreaming, setIsStreaming] = useState(false);

    const [mediaConstraints, setMediaConstraints] = useState(null);
    const [audioSource, setAudioSource] = useState(null);
    const [videoSource, setVideoSource] = useState(null);

    const [streamStartTimeIsNow, setStreamStartTimeIsNow] = useState(false);
    const { permissionGranted, userMediaError, localStream } = useLocalStream(mediaConstraints);

    const [showDisconnectionModal, setShowDisconnectionModal] = useState(false);

    const localVideoId = 'localVideo';
    const  isPlayMode = false;

    let streamingCallbacks = {
        onInitialized: (infoObj) => {},
        onPublishStarted: (infoObj) => {
            setShowDisconnectionModal(false);
            setIsStreaming(true);
        },
        onJoinedTheRoom: (infoObj) => {
        },
        onStreamLeaved: (infoObj) => {
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
            props.currentLivestream.id,
            props.currentLivestream.id
        );
    useEffect(() => {
        if (props.currentLivestream.speakerSwitchMode === 'automatic') {
            if (audioLevels && audioLevels.length > 0) {
                const maxEntry = audioLevels.reduce((prev, current) => (prev.audioLevel > current.audioLevel) ? prev : current);
                setLivestreamCurrentSpeakerId(maxEntry.streamId);
            }
        } else {
            if (props.currentLivestream) {
                setLivestreamCurrentSpeakerId(props.currentLivestream.currentSpeakerId);
            }
        }       
    }, [audioLevels]);

    useEffect(() => {
        if (props.currentLivestream.start) {
            let interval = setInterval(() => {
                if (dateIsInUnder2Minutes(props.currentLivestream.start.toDate())) {
                    setStreamStartTimeIsNow(true);
                    clearInterval(interval);
                }
            }, 1000)
        }
    }, [props.currentLivestream.start]);

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

    function setLivestreamCurrentSpeakerId(id) {
        props.firebase.setLivestreamCurrentSpeakerId(props.currentLivestream.id, id);
    }

    function setLiveSpeakerDisconnected(speakerId) {
        if (registeredSpeaker) {
            props.firebase.setLivestreamLiveSpeakersDisconnected(props.currentLivestream.id, speakerId);
        }
    }

    function dateIsInUnder2Minutes(date) {
        return new Date(date).getTime() - Date.now() < 1000*60*2 || Date.now() > new Date(date).getTime();
    }

    return (
        <Fragment>
            <div>
                <CurrentSpeakerDisplayer isPlayMode={false} smallScreenMode={props.currentLivestream.mode === 'presentation'} speakerSwitchModeActive={props.currentLivestream.speakerSwitchMode === "manual"} setLivestreamCurrentSpeakerId={setLivestreamCurrentSpeakerId} localId={props.currentLivestream.id} localStream={localStream} streams={externalMediaStreams} mediaConstraints={mediaConstraints} currentSpeaker={props.currentLivestream.currentSpeakerId} muted={false}/>
            </div>
            <div style={{ display: (props.currentLivestream.mode === 'presentation' ? 'block' : 'none')}}>
                <SmallStreamerVideoDisplayer isPlayMode={false} localStream={localStream} streams={externalMediaStreams} mediaConstraints={mediaConstraints} livestreamId={props.currentLivestream.id} presenter={true}/>
            </div>
            <div className='button-container'>         
                <Grid centered className='middle aligned'>
                    <Grid.Column width={10} textAlign='center'>
                        <div className='countdown' style={{ display: (props.currentLivestream.hasStarted || !props.currentLivestream.start || !showLivestreamCountdown ) ? 'none' : 'block', backgroundColor: streamStartTimeIsNow ? 'rgba(0, 210, 170, 0.8)' : 'rgba(100,100,100,0.8)'}}>
                            <Icon name='delete' onClick={() => setShowLivestreamCountdown(false)} style={{ position: 'absolute', top: '22px', right: '20px', color: 'white' }}/>
                            <div>Your livestream is scheduled to start in</div>
                            <CountdownTimer date={ props.currentLivestream.start ? props.currentLivestream.start.toDate() : null }><span>Press Start Streaming to start the event</span></CountdownTimer>
                        </div>
                    </Grid.Column>
                </Grid>
            </div> 
            <Modal open={showDisconnectionModal}>
                <Modal.Header>You have been disconnected</Modal.Header>
                <Modal.Content>
                    <p>No need to panic! To rejoin the stream, simply check your internet connection and reload this page.</p>
                    <Button content='Reload' primary/>
                </Modal.Content>
            </Modal>
            <StreamPreparationModal streamerReady={streamerReady} setStreamerReady={setStreamerReady} localStream={localStream} mediaConstraints={mediaConstraints} connectionEstablished={connectionEstablished} setConnectionEstablished={setConnectionEstablished} errorMessage={errorMessage} isStreaming={isStreaming} audioSource={audioSource} setAudioSource={setAudioSource} videoSource={videoSource} setVideoSource={setVideoSource}/>
            <style jsx>{`
                .hidden {
                    display: none
                }

                .fixed {
                    position: fixed;
                    top: 0;
                    right: 0;
                    background-color: red;
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
        </Fragment>
    );
}

export default withFirebasePage(VideoContainer);