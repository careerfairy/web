import React, {useState, useEffect, Fragment, useRef, useContext} from 'react';
import {Button, Modal} from "semantic-ui-react";

import {withFirebasePage} from 'context/firebase';

import useWebRTCAdaptor from 'components/custom-hook/useWebRTCAdaptor';
import CurrentSpeakerDisplayer from './CurrentSpeakerDisplayer';
import SmallStreamerVideoDisplayer from './SmallStreamerVideoDisplayer';
import VideoControlsContainer from './VideoControlsContainer';
import StreamPreparationModalV2 from "../modal/StreamPreparationModalV2/StreamPreparationModalV2";
import ErrorMessageModal from "../modal/StreamPreparationModalV2/ErrorMessageModal";
import useDevices from 'components/custom-hook/useDevices';
import SettingsModal from './SettingsModal';
import { makeStyles } from '@material-ui/core';
import TutorialContext from "../../../../context/tutorials/TutorialContext";
import DemoIntroModal from "../modal/DemoIntroModal";
import DemoEndModal from "../modal/DemoEndModal";
import LocalStorageUtil from 'util/LocalStorageUtil';
import useMediaSources from 'components/custom-hook/useMediaSources';

const useStyles = makeStyles((theme) => ({
    blackFrame: {
        position: "absolute",                
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    }
}));


function VideoContainer(props) {
    const {tutorialSteps, setTutorialSteps, showBubbles, setShowBubbles, handleConfirmStep, getActiveTutorialStepKey} = useContext(TutorialContext);
    
    const classes = useStyles();
    const devices = useDevices();
    const localVideoId = 'localVideo';
    const isPlayMode = false;
    const isMainStreamer = props.streamerId === props.currentLivestream.id;

    const [errorMessage, setErrorMessage] = useState(null);
    const [showDemoIntroModal, setShowDemoIntroModal] = useState(false);
    const [streamerReady, setStreamerReady] = useState(false);
    const [connectionEstablished, setConnectionEstablished] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);

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
    const [showSettings, setShowSettings] = useState(false);

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
        onScreenShareStopped: (infoObj) => {
            if (isExistingCallback('onScreenShareStopped')) {
                props.additionalCallbacks.onScreenShareStopped(infoObj);
            }
            setDesktopMode("default", props.streamerId);
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

    const {webRTCAdaptor, externalMediaStreams, localMediaStream, setAddedStream, removeStreamFromExternalMediaStreams, audioLevels} =
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

    const { audioSource,
        updateAudioSource,
        videoSource,
        updateVideoSource,
        speakerSource,
        updateSpeakerSource,
        audioLevel } = useMediaSources(devices, webRTCAdaptor, props.streamerId, localMediaStream, !streamerReady || showSettings );

    useEffect(() => {
        return () => {
            if (webRTCAdaptor) {
                webRTCAdaptor.closeWebSocket();
            }
        }
    }, [webRTCAdaptor]);


    useEffect(() => {
        if (isMainStreamer && props.currentLivestream.mode !== 'desktop') {
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
    }, [audioCounter, props.currentLivestream.mode]);

    useEffect(() => {
        if (isMainStreamer && props.currentLivestream.mode === 'desktop') {
            setLivestreamCurrentSpeakerId(props.currentLivestream.screenSharerId);
        }
    },[props.currentLivestream.mode])

    useEffect(() => {
        if (props.streamerId && props.currentLivestream.id ) {
            if (props.currentLivestream.mode === 'desktop' && props.currentLivestream.screenSharerId === props.streamerId) {
                setDesktopMode("default", props.streamerId);
            }
        }
    },[props.streamerId, props.currentLivestream.id])

    useEffect(() => {
        if (webRTCAdaptor) {
            if (props.currentLivestream.mode === 'desktop' && props.currentLivestream.screenSharerId === props.streamerId) {
                webRTCAdaptor.switchDesktopCaptureWithCamera(props.streamerId);
            } else {
                webRTCAdaptor.switchVideoCameraCapture(props.streamerId);
            }
        }
    }, [props.currentLivestream.mode]);

    useEffect(() => {
        if (externalMediaStreams && props.currentLivestream.currentSpeakerId && isMainStreamer) {
            let existingCurrentSpeaker = externalMediaStreams.find( stream => stream.streamId === props.currentLivestream.currentSpeakerId)
            if (!existingCurrentSpeaker) {
                setLivestreamCurrentSpeakerId(props.currentLivestream.id);
            }
        }
    }, [externalMediaStreams]);

    const setDesktopMode = async (mode, initiatorId) => {
        await props.firebase.setDesktopMode(props.currentLivestream.id, mode, initiatorId);
        setLivestreamCurrentSpeakerId(initiatorId)
    }

    const setLivestreamCurrentSpeakerId = (id) => {
        props.firebase.setLivestreamCurrentSpeakerId(props.currentLivestream.id, id);
    }

    const reloadPage = () => {
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

    useEffect(() => {
        const activeStep = getActiveTutorialStepKey();
        if (webRTCAdaptor) {
            if (activeStep > 10 && activeStep < 13) {
                setAddedStream({
                    streamId: "demoStream",
                    url: "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/speaker-video%2Fvideoblocks-confident-male-coach-lector-recording-educational-video-lecture_r_gjux7cu_1080__D.mp4?alt=media"
                })
            } else {
                removeStreamFromExternalMediaStreams("demoStream");
            }
        }
    },[tutorialSteps])

    const isOpen = (property) => {
        return Boolean(props.currentLivestream.test
            && tutorialSteps.streamerReady
            && tutorialSteps[property]
        )
    }

    const handleCloseDemoIntroModal = (wantsDemo) => {
        setShowDemoIntroModal(false)
        if (wantsDemo) {
            setShowBubbles(true)
            setTutorialSteps({
                ...tutorialSteps,
                streamerReady: true,
            })
        } else {
            setShowBubbles(true)
        }

    }

    const handleOpenDemoIntroModal = () => {
        setShowDemoIntroModal(true)
    }

    const handleCloseDemoEndModal = () => {
        handleConfirmStep(17)
        setShowBubbles(true)
    }

    return (
        <Fragment>
            <div className={classes.blackFrame}>
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
                        localStream={localMediaStream} rn
                        streams={externalMediaStreams} 
                        mediaConstraints={mediaConstraints} 
                        livestreamId={props.currentLivestream.id} 
                        showMenu={props.showMenu}
                        presenter={true}/>
                    : null
                }
                <VideoControlsContainer 
                    webRTCAdaptor={webRTCAdaptor} 
                    currentLivestream={props.currentLivestream}
                    viewer={props.viewer} 
                    streamerId={props.streamerId}
                    joining={!isMainStreamer}
                    isMainStreamer={isMainStreamer}
                    setDesktopMode={setDesktopMode}
                    showSettings={showSettings}
                    setShowSettings={setShowSettings}
                    />
            </div>
            <SettingsModal open={showSettings} close={() => setShowSettings(false)} 
                webRTCAdaptor={webRTCAdaptor} streamId={props.streamerId} 
                devices={devices} localStream={localMediaStream}
                audioSource={audioSource} updateAudioSource={updateAudioSource} 
                videoSource={videoSource} updateVideoSource={updateVideoSource}  audioLevel={audioLevel}
                speakerSource={speakerSource} setSpeakerSource={updateSpeakerSource} 
                attachSinkId={attachSinkId}/>
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
            { !streamerReady && <StreamPreparationModalV2 readyToConnect={(props.currentLivestream && props.currentLivestream.id)} audioSource={audioSource} updateAudioSource={updateAudioSource}
                                    videoSource={videoSource} updateVideoSource={updateVideoSource} audioLevel={audioLevel}
                                    speakerSource={speakerSource} setSpeakerSource={updateSpeakerSource}
                                    streamerReady={streamerReady} setStreamerReady={setStreamerReady}
                                    localStream={localMediaStream} mediaConstraints={mediaConstraints}
                                    connectionEstablished={connectionEstablished}
                                    isTest={props.currentLivestream.test} viewer={props.viewer}
                                    handleOpenDemoIntroModal={handleOpenDemoIntroModal}
                                    attachSinkId={attachSinkId} devices={devices}
                                    setConnectionEstablished={setConnectionEstablished} errorMessage={errorMessage}
                                    isStreaming={isStreaming}/>}
            <ErrorMessageModal isStreaming={isStreaming} connectionEstablished={connectionEstablished}
                               errorMessage={errorMessage} streamerReady={streamerReady}/>
            <DemoIntroModal livestreamId={props.currentLivestream.id}
                            open={showDemoIntroModal}
                            handleClose={handleCloseDemoIntroModal}/>
            <DemoEndModal open={isOpen(17)} handleClose={handleCloseDemoEndModal}/>
            <style jsx>{`
                .screen-container {
                    position: absolute;                 
                    top: 0;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    border: 2px solid red;
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