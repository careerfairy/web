import {useState, useEffect, Fragment, useRef} from 'react';
import {Button, Grid, Icon, Input, Modal} from "semantic-ui-react";

import {withFirebasePage} from 'context/firebase';

import CountdownTimer from 'components/views/common/Countdown';
import {useLocalStream} from 'components/custom-hook/useLocalStream';
import useWebRTCAdaptor from 'components/custom-hook/useWebRTCAdaptor';
import CurrentSpeakerDisplayer from './CurrentSpeakerDisplayer';
import SmallStreamerVideoDisplayer from './SmallStreamerVideoDisplayer';
import StreamPreparationModal from 'components/views/streaming/modal/StreamPreparationModal';
import VideoControlsContainer from './VideoControlsContainer';

function VideoContainer(props) {

    const [errorMessage, setErrorMessage] = useState(null);

    const [streamerReady, setStreamerReady] = useState(false);
    const [connectionEstablished, setConnectionEstablished] = useState(false);

    const [isStreaming, setIsStreaming] = useState(false);

    const [mediaConstraints, setMediaConstraints] = useState(null);
    const [audioSource, setAudioSource] = useState(null);
    const [videoSource, setVideoSource] = useState(null);

    const {permissionGranted, userMediaError, localStream} = useLocalStream(mediaConstraints);
    const [audioCounter, setAudioCounter] = useState(0);

    const [showDisconnectionModal, setShowDisconnectionModal] = useState(false);

    const localVideoId = 'localVideo';
    const isPlayMode = false;

    useEffect(() => {
        return () => console.log('VideoContainer destroyed');
    }, []);

    function isExistingCallback(callbackName) {
        return props.additionalCallbacks && typeof props.additionalCallbacks[callbackName] === 'function';
    }

    let streamingCallbacks = {
        onPublishStarted: (infoObj) => {
            if (isExistingCallback('onPublishStarted')) {
                props.additionalCallbacks.onPublishStarted(infoObj);
            }
            setShowDisconnectionModal(false);
            setIsStreaming(true);
        },
        onPublishFinished: (infoObj) => {
            if (isExistingCallback('onPublishFinished')) {
                props.additionalCallbacks.onPublishFinished(infoObj);
            }
            setIsStreaming(false);
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
    }

    let errorCallbacks = {
        onScreenSharePermissionDenied: () => {
            if (isExistingCallback('onScreenSharePermissionDenied')) {
                props.additionalCallbacks.onScreenSharePermissionDenied();
            }
            setDesktopMode("default", props.streamerId);
        },
        onOtherError: (error) => {
            if (typeof error === "string") {
                setErrorMessage(error);
            } else {
                setErrorMessage("A connection error occured");
            }
        }
    }

    const {webRTCAdaptor, externalMediaStreams, removeStreamFromExternalMediaStreams, audioLevels} =
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

    const isMainStreamer = props.streamerId === props.currentLivestream.id;

    useEffect(() => {
        if (isMainStreamer && props.currentLivestream.speakerSwitchMode === 'automatic') {
            let timeout = setTimeout(() => {
                console.log(audioLevels)
                if (audioLevels && audioLevels.length > 0) {
                    const maxEntry = audioLevels.reduce((prev, current) => (prev.audioLevel > current.audioLevel) ? prev : current);
                    if (maxEntry.audioLevel > 0.05) {
                        setLivestreamCurrentSpeakerId(maxEntry.streamId);
                    }
                }
                setAudioCounter(audioCounter + 1);
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [audioCounter, props.currentLivestream.speakerSwitchMode]);

    useEffect(() => {
        const constraints = {
            audio: {deviceId: audioSource || undefined},
            video: {
                width: {ideal: 1920, max: 1920},
                height: {ideal: 1080, max: 1080},
                aspectRatio: 1.77,
                deviceId: videoSource ? videoSource : undefined
            }
        };
        setMediaConstraints(constraints);
    }, [audioSource, videoSource]);

    useEffect(() => {
        if (webRTCAdaptor) {
            if (props.currentLivestream.mode === 'desktop' && props.currentLivestream.screenSharerId === props.streamerId) {
                webRTCAdaptor.switchDesktopCaptureWithCamera(props.streamerId);
            } else {
                webRTCAdaptor.switchVideoCameraCapture(props.streamerId);
            }
        }
    }, [props.currentLivestream.mode]);

    const setDesktopMode = async (mode, initiatorId) => {
        await props.firebase.setDesktopMode(props.currentLivestream.id, mode, initiatorId);
        setLivestreamCurrentSpeakerId(initiatorId)
        if (props.currentLivestream.speakerSwitchMode === "automatic") {
            await props.firebase.setLivestreamSpeakerSwitchMode(props.currentLivestream.id, "manual");
        }
    }

    function setLivestreamCurrentSpeakerId(id) {
        props.firebase.setLivestreamCurrentSpeakerId(props.currentLivestream.id, id);
    }

    function reloadPage() {
        location.reload();
    }

    return (
        <Fragment>
            <div className='screen-container'>
                <div>
                    <CurrentSpeakerDisplayer isPlayMode={false}
                                             smallScreenMode={props.currentLivestream.mode === 'presentation'}
                                             speakerSwitchModeActive={isMainStreamer}
                                             setLivestreamCurrentSpeakerId={setLivestreamCurrentSpeakerId}
                                             removeStreamFromExternalMediaStreams={removeStreamFromExternalMediaStreams}
                                             localId={props.streamerId}
                                             localStream={localStream}
                                             streams={externalMediaStreams}
                                             mediaConstraints={mediaConstraints}
                                             currentSpeaker={props.currentLivestream.currentSpeakerId}
                                             {...props}
                                             muted={false}/>
                </div>
                {props.currentLivestream.mode === 'presentation' ?
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
                <VideoControlsContainer setDesktopMode={setDesktopMode}
                                        streamerId={props.streamerId} webRTCAdaptor={webRTCAdaptor} 
                                        isMainStreamer={isMainStreamer} currentLivestream={props.currentLivestream}
                                        viewer={props.viewer} joining={!isMainStreamer}/>
            </div>
            <Modal open={showDisconnectionModal}>
                <Modal.Header>You have been disconnected</Modal.Header>
                <Modal.Content>
                    <p>Don't panic! Follow these steps to quickly restart the stream:</p>
                    <p>1. Check your internet connection</p>
                    <p>2. Reload this page</p>
                    <p>3. Restart the stream</p>
                    <Button icon='undo alternate' content='Reload Page' size='large' primary
                            onClick={() => reloadPage()}/>
                </Modal.Content>
            </Modal>
            <StreamPreparationModal streamerReady={streamerReady} setStreamerReady={setStreamerReady}
                                    localStream={localStream} mediaConstraints={mediaConstraints}
                                    connectionEstablished={connectionEstablished}
                                    setConnectionEstablished={setConnectionEstablished} errorMessage={errorMessage}
                                    isStreaming={isStreaming} audioSource={audioSource} setAudioSource={setAudioSource}
                                    videoSource={videoSource} setVideoSource={setVideoSource}/>
            <style jsx>{`
                .screen-container {
                    position: absolute;                 
                    top: 0;
                    bottom: 0;
                    left: 0;
                    right: 0;
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