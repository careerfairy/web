import {useState, useEffect, Fragment, useRef} from 'react';
import {Button, Grid, Icon, Input, Modal} from "semantic-ui-react";

import {withFirebasePage} from 'context/firebase';

import CountdownTimer from 'components/views/common/Countdown';

import useWebRTCAdaptor from 'components/custom-hook/useWebRTCAdaptor';
import CurrentSpeakerDisplayer from './CurrentSpeakerDisplayer';
import SmallStreamerVideoDisplayer from './SmallStreamerVideoDisplayer';
import SharingOptionsContainer from './SharingOptionsContainer';
import StreamPreparationModalV2 from "../modal/StreamPreparationModalV2/StreamPreparationModalV2";
import ErrorMessageModal from "../modal/StreamPreparationModalV2/ErrorMessageModal";
import useDevices from 'components/custom-hook/useDevices';

function VideoContainer(props) {

    const [errorMessage, setErrorMessage] = useState(null);
    const [streamerReady, setStreamerReady] = useState(false);
    const [connectionEstablished, setConnectionEstablished] = useState(false);

    const [isStreaming, setIsStreaming] = useState(false);
    const [speakerSource, setSpeakerSource] = useState(null);

    const [mediaConstraints, setMediaConstraints] = useState({
        audio: true,
        video: { 
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 },
            aspectRatio: 1.77,   
        }
    });

    const [audioCounter, setAudioCounter] = useState(0);
    const [showDisconnectionModal, setShowDisconnectionModal] = useState(false);

    const devices = useDevices();
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


    const { webRTCAdaptor, localMediaStream, externalMediaStreams, removeStreamFromExternalMediaStreams, audioLevels } = 
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
        if (webRTCAdaptor) {
            if (props.currentLivestream.mode === 'desktop') {
                webRTCAdaptor.switchDesktopCaptureWithCamera(props.streamerId);
            } else {
                webRTCAdaptor.switchVideoCameraCapture(props.streamerId);
            }
        }
    }, [props.currentLivestream.mode]);

    function setLivestreamCurrentSpeakerId(id) {
        props.firebase.setLivestreamCurrentSpeakerId(props.currentLivestream.id, id);
    }

    function reloadPage() {
        location.reload();
    }

    const attachSinkId = (element, sinkId) => {
        if (typeof element.sinkId !== 'undefined') {
            element.setSinkId(sinkId)
                .then(() => {
                    console.log(`Success, audio output device attached: ${sinkId}`);
                })
                .catch(error => {
                    let errorMessage = error;
                    if (error.name === 'SecurityError') {
                        errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
                    }
                    console.error(errorMessage);
                    // Jump back to first output device in the list as it's the default.
                });
        } else {
            console.warn('Browser does not support output device selection.');
        }
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
                        localStream={localMediaStream} 
                        speakerSource={speakerSource}
                        attachSinkId={attachSinkId}
                        streams={externalMediaStreams} 
                        mediaConstraints={mediaConstraints} 
                        currentSpeaker={props.currentLivestream.currentSpeakerId} 
                        {...props}
                        muted={false}/>
                </div>
                { props.currentLivestream.mode === 'presentation' ?
                    <SmallStreamerVideoDisplayer 
                        isPlayMode={false} 
                        localStream={localMediaStream} 
                        streams={externalMediaStreams} 
                        mediaConstraints={mediaConstraints} 
                        livestreamId={props.currentLivestream.id} 
                        showMenu={props.showMenu}
                        presenter={true}/>
                    : null
                }
            </div>
            <div className='controls-container'>
                <SharingOptionsContainer webRTCAdaptor={webRTCAdaptor} currentLivestream={props.currentLivestream}
                                        viewer={props.viewer} joining={!isMainStreamer}/>
            </div>
            <div className='controls-container'>
                <VideoControlsContainer webRTCAdaptor={webRTCAdaptor} currentLivestream={props.currentLivestream}
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
            {/*<StreamPreparationModal streamerReady={streamerReady} setStreamerReady={setStreamerReady} localStream={localStream} mediaConstraints={mediaConstraints} connectionEstablished={connectionEstablished} setConnectionEstablished={setConnectionEstablished} errorMessage={errorMessage} isStreaming={isStreaming} audioSource={audioSource} setAudioSource={setAudioSource} videoSource={videoSource} setVideoSource={setVideoSource}/>*/}
            <StreamPreparationModalV2 speakerSource={speakerSource} setSpeakerSource={setSpeakerSource}
                                      streamerReady={streamerReady} setStreamerReady={setStreamerReady}
                                      localStream={localMediaStream} mediaConstraints={mediaConstraints}
                                      connectionEstablished={connectionEstablished}
                                      attachSinkId={attachSinkId} devices={devices}
                                      setConnectionEstablished={setConnectionEstablished} errorMessage={errorMessage}
                                      webRTCAdaptor={webRTCAdaptor} streamId={props.streamerId}
                                      isStreaming={isStreaming}/>
            <ErrorMessageModal isStreaming={isStreaming} connectionEstablished={connectionEstablished}
                               errorMessage={errorMessage} streamerReady={streamerReady}/>
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