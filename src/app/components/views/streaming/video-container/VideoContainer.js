import {useState, useEffect, Fragment, useRef} from 'react';
import {Button, Grid, Icon, Input, Modal} from "semantic-ui-react";

import { withFirebasePage } from 'context/firebase';

import CountdownTimer from 'components/views/common/Countdown';
import { useLocalStream } from 'components/custom-hook/useLocalStream';
import useWebRTCAdaptor from 'components/custom-hook/useWebRTCAdaptor';
import CurrentSpeakerDisplayer from './CurrentSpeakerDisplayer';
import SmallStreamerVideoDisplayer from './SmallStreamerVideoDisplayer';
import StreamPreparationModal from 'components/views/streaming/modal/StreamPreparationModal';
import VideoControlsContainer from './VideoControlsContainer';

function VideoContainer(props) {

    const videoContainerRef = useRef();

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

    useEffect(() => {
        return () => console.log('VideoContainer destroyed');
    },[]);

    function isExistingCallback(callbackName) {
        return props.additionalCallbacks && typeof props.additionalCallbacks[callbackName] === 'function';
    }

    let streamingCallbacks = {
        onInitialized: (infoObj) => {
            if (isExistingCallback('onInitialized')) {
                props.additionalCallbacks.onInitialized(infoObj);
            }
        },
        onPublishStarted: (infoObj) => {
            if (isExistingCallback('onPublishStarted')) {
                    props.additionalCallbacks.onPublishStarted(infoObj);
            }
            setShowDisconnectionModal(false);
            setIsStreaming(true);
        },
        onJoinedTheRoom: (infoObj) => {
            if (isExistingCallback('onJoinedTheRoom')) {
                    props.additionalCallbacks.onJoinedTheRoom(infoObj);
            }
        },
        onStreamLeaved: (infoObj) => {
            if (isExistingCallback('onStreamLeaved')) {
                    props.additionalCallbacks.onStreamLeaved(infoObj);
            }
        },
        onPublishFinished: (infoObj) => {
            if (isExistingCallback('onPublishFinished')) {
                    props.additionalCallbacks.onPublishFinished(infoObj);
            }
            setIsStreaming(false);
        },
        onScreenShareStopped: (infoObj) => {
            if (isExistingCallback('onScreenShareStopped')) {
                props.additionalCallbacks.onScreenShareStopped(infoObj);
            }
        },
        onDisconnected: (infoObj) => {
            if (isExistingCallback('onDisconnected')) {
                    props.additionalCallbacks.onDisconnected(infoObj);
            }
            setShowDisconnectionModal(true);
        },
        onConnected: (infoObj) => {
            if (isExistingCallback('onConnected')) {
                props.additionalCallbacks.onConnected(infoObj);
            }
            setShowDisconnectionModal(false);
        },
        onClosed: (infoObj) => {
            if (isExistingCallback('onJoinedTheRoom')) {
                props.additionalCallbacks.onJoinedTheRoom(infoObj);
            }
        },
        onUpdatedStats: (infoObj) => {
            if (isExistingCallback('onUpdatedStats')) {
                props.additionalCallbacks.onUpdatedStats(infoObj);
            }
        },
    }

    let errorCallbacks = {
        onScreenSharePermissionDenied: () => {
            if (isExistingCallback('onScreenSharePermissionDenied')) {
                props.additionalCallbacks.onScreenSharePermissionDenied(infoObj);
            }
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
            props.currentLivestream.id,
            props.streamerId
        );

    useEffect(() => {
        return () => { 
            if (webRTCAdaptor) {
                webRTCAdaptor.closeWebSocket();
            }
        }
    }, [webRTCAdaptor]);

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

    useEffect(() => {
        if (webRTCAdaptor) {
            if (props.currentLivestream.mode === 'desktop') {
                webRTCAdaptor.switchDesktopCaptureWithCamera(props.streamerId);
            } else {
                webRTCAdaptor.switchVideoCameraCapture(props.streamerId);
            }
        }
    },[props.currentLivestream.mode]);

    function setLivestreamCurrentSpeakerId(id) {
        props.firebase.setLivestreamCurrentSpeakerId(props.currentLivestream.id, id);
    }

    function dateIsInUnder2Minutes(date) {
        return new Date(date).getTime() - Date.now() < 1000*60*2 || Date.now() > new Date(date).getTime();
    }

    const isMainStreamer = props.streamerId === props.currentLivestream.id;

    return (
        <Fragment>
            <div className='screen-container'>
                <div>
                    <CurrentSpeakerDisplayer isPlayMode={false} 
                        smallScreenMode={props.currentLivestream.mode === 'presentation'} 
                        speakerSwitchModeActive={isMainStreamer} 
                        setLivestreamCurrentSpeakerId={setLivestreamCurrentSpeakerId} 
                        localId={props.streamerId} 
                        localStream={localStream} 
                        streams={externalMediaStreams} 
                        mediaConstraints={mediaConstraints} 
                        currentSpeaker={props.currentLivestream.currentSpeakerId} 
                        muted={false}/>
                </div>
                { props.currentLivestream.mode === 'presentation' ?
                    <SmallStreamerVideoDisplayer 
                        isPlayMode={false} 
                        localStream={localStream} 
                        streams={externalMediaStreams} 
                        mediaConstraints={mediaConstraints} 
                        livestreamId={props.currentLivestream.id} 
                        showMenu={props.showMenu}
                        presenter={true}/>
                    : null
                }
            </div>
            <div className='controls-container'>
                <VideoControlsContainer webRTCAdaptor={webRTCAdaptor} currentLivestream={props.currentLivestream}/>
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
                .screen-container {
                    position: absolute;                 
                    top: 0;
                    bottom: 0;
                    left: 0;
                    right: 120px;
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
            `}</style>
        </Fragment>
    );
}

export default withFirebasePage(VideoContainer);