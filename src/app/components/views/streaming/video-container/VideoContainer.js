import React, {Fragment, useCallback, useContext, useEffect, useState} from 'react';

import {withFirebasePage} from 'context/firebase';
import useAgoraAsStreamer from 'components/custom-hook/useAgoraAsStreamer';
import CurrentSpeakerDisplayer from './CurrentSpeakerDisplayer';
import SmallStreamerVideoDisplayer from './SmallStreamerVideoDisplayer';
import VideoControlsContainer from './VideoControlsContainer';
import StreamPreparationModalV2 from "../modal/StreamPreparationModalV2/StreamPreparationModalV2";
import useDevices from 'components/custom-hook/useDevices';
import {makeStyles} from "@material-ui/core/styles";
import TutorialContext from "context/tutorials/TutorialContext";
import DemoIntroModal from "../modal/DemoIntroModal";
import DemoEndModal from "../modal/DemoEndModal";

import useMediaSources from 'components/custom-hook/useMediaSources';
import WifiIndicator from "./WifiIndicator";
import LoadingModal from '../modal/LoadingModal';
import ErrorModal from '../modal/ErrorModal';
import SettingsModal from "./SettingsModal";
import ScreenShareModal from "./ScreenShareModal";

const useStyles = makeStyles((theme) => ({
    blackFrame: {
        // position: "absolute",
        // top: 0,
        // right: 0,
        // bottom: 0,
        // left: 0,
    }
}));

function VideoContainer(props) {
    const {
        tutorialSteps,
        setTutorialSteps,
        showBubbles,
        setShowBubbles,
        handleConfirmStep,
        getActiveTutorialStepKey
    } = useContext(TutorialContext);
    const classes = useStyles();
    const localVideoId = 'localVideo';
    const isMainStreamer = props.streamerId === props.currentLivestream.id;

    const [errorMessage, setErrorMessage] = useState(null);
    const [screenSharePermissionDenied, setScreenSharePermissionDenied] = useState(false);
    const [showDemoIntroModal, setShowDemoIntroModal] = useState(false);

    const [streamerConnected, setStreamerConnected] = useState(false);
    const [streamerReady, setStreamerReady] = useState(false);

    const [connectionEstablished, setConnectionEstablished] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [showScreenShareModal, setShowScreenShareModal] = useState(false);
    const [optimizationMode, setOptimizationMode] = useState("detail");

    const [audioCounter, setAudioCounter] = useState(0);
    const [showSettings, setShowSettings] = useState(false);

    const screenSharingMode = (props.currentLivestream.screenSharerId === props.streamerId &&
        props.currentLivestream.mode === 'desktop') ? optimizationMode : "";

    const {
        localMediaStream,
        setLocalMediaStream,
        externalMediaStreams,
        agoraRtcStatus,
        agoraRtmStatus,
        networkQuality,
        numberOfViewers,
        setAddedStream,
        setRemovedStream
    } =
        useAgoraAsStreamer(
            true,
            false,
            localVideoId,
            screenSharingMode,
            props.currentLivestream.id,
            props.streamerId,
            props.viewer,
        );

    const devices = useDevices(agoraRtcStatus && agoraRtcStatus.msg === "RTC_STREAM_PUBLISHED");

    const {
        audioSource,
        updateAudioSource,
        videoSource,
        updateVideoSource,
        speakerSource,
        updateSpeakerSource,
        localMediaStream: displayableMediaStream,
        audioLevel
    } = useMediaSources(devices, props.streamerId, localMediaStream, !streamerReady || showSettings);

    useEffect(() => {
        if (isMainStreamer && props.currentLivestream.mode !== 'desktop' && props.currentLivestream.speakerSwitchMode !== 'manual') {
            let timeout = setTimeout(() => {
                let audioLevels = externalMediaStreams.map(stream => {
                    if (stream.streamId !== 'demoStream') {
                        return {
                            streamId: stream.streamId,
                            audioLevel: stream.stream.getAudioLevel()
                        }
                    } else {
                        return {
                            streamId: stream.streamId,
                            audioLevel: 0
                        }
                    }
                });
                if (localMediaStream) {
                    audioLevels.push({
                        streamId: localMediaStream.getId(),
                        audioLevel: localMediaStream.getAudioLevel()
                    });
                }
                if (audioLevels && audioLevels.length > 1) {
                    const maxEntry = audioLevels.reduce((prev, current) => (prev.audioLevel > current.audioLevel) ? prev : current);
                    if (maxEntry.audioLevel > 0.05) {
                        setLivestreamCurrentSpeakerId(maxEntry.streamId);
                    } else if (!audioLevels.some(audioLevel => audioLevel.streamId === props.currentLivestream.currentSpeakerId)) {
                        setLivestreamCurrentSpeakerId(maxEntry.streamId);
                    }
                }
                setAudioCounter(audioCounter + 1);
            }, 2500);
            return () => clearTimeout(timeout);
        }
    }, [audioCounter, props.currentLivestream.mode]);

    useEffect(() => {
        if (agoraRtcStatus && agoraRtcStatus.type === "INFO" && agoraRtcStatus.msg === "RTC_STREAM_PUBLISHED") {
            setStreamerConnected(true)
        }
    }, [agoraRtcStatus])

    useEffect(() => {
        if (agoraRtcStatus && (agoraRtcStatus.msg === "RTC_SCREEN_SHARE_STOPPED" || agoraRtcStatus.msg === "RTC_SCREEN_SHARE_NOT_ALLOWED") && props.currentLivestream.mode === 'desktop' && props.currentLivestream.screenSharerId === props.streamerId) {
            setDesktopMode("default", props.streamerId)
        }
    }, [agoraRtcStatus])

    useEffect(() => {
        if (isMainStreamer && props.currentLivestream.mode === 'desktop') {
            setLivestreamCurrentSpeakerId(props.currentLivestream.screenSharerId);
        }
    }, [props.currentLivestream.mode])

    useEffect(() => {
        if (props.streamerId && props.currentLivestream.id) {
            if (props.currentLivestream.mode === 'desktop' && props.currentLivestream.screenSharerId === props.streamerId) {
                setDesktopMode("default", props.streamerId);
            }
        }
    }, [props.streamerId, props.currentLivestream.id])

    useEffect(() => {
        if (externalMediaStreams && props.currentLivestream.currentSpeakerId && isMainStreamer) {
            let existingCurrentSpeaker = externalMediaStreams.find(stream => stream.streamId === props.currentLivestream.currentSpeakerId)
            if (!existingCurrentSpeaker) {
                setLivestreamCurrentSpeakerId(props.currentLivestream.id);
            }
        }
    }, [externalMediaStreams])

    const [timeoutState, setTimeoutState] = useState(null);

    useEffect(() => {
        if (localMediaStream && externalMediaStreams && externalMediaStreams.length > 3) {
            if (props.streamerId === props.currentLivestream.currentSpeakerId && props.currentLivestream.mode !== "desktop" && props.currentLivestream.mode !== "presentation") {
                if (timeoutState) {
                    clearTimeout(timeoutState);
                }
                let newTimeout = setTimeout(() => {
                    localMediaStream.setVideoProfile("480p_9")
                }, 20000);
                setTimeoutState(newTimeout)
            } else {
                if (timeoutState) {
                    clearTimeout(timeoutState);
                }
                let newTimeout = setTimeout(() => {
                    localMediaStream.setVideoProfile("180p")
                }, 20000);
                setTimeoutState(newTimeout)
            }
        }
    }, [localMediaStream, externalMediaStreams, props.currentLivestream.currentSpeakerId, props.currentLivestream.mode])

    useEffect(() => {
        if (numberOfViewers && props.currentLivestream.hasStarted) {
            props.setNumberOfViewers(numberOfViewers)
        } else {
            props.setNumberOfViewers(0)
        }
    }, [numberOfViewers, props.currentLivestream.hasStarted]);

    const setDesktopMode = async (mode, initiatorId) => {
        let screenSharerId = mode === 'desktop' ? initiatorId : props.currentLivestream.screenSharerId;
        await props.firebase.setDesktopMode(props.currentLivestream.id, mode, screenSharerId);
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
        if (localMediaStream && activeStep > 0) {
            if (activeStep > 10 && activeStep < 13) {
                if (!externalMediaStreams.some(stream => stream.streamId === 'demoStream')) {
                    setAddedStream({
                        streamId: "demoStream",
                        url: "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/speaker-video%2Fvideoblocks-confident-male-coach-lector-recording-educational-video-lecture_r_gjux7cu_1080__D.mp4?alt=media"
                    })
                }
            } else {
                setRemovedStream("demoStream");
            }
        }
    }, [tutorialSteps])

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

    const handleCloseScreenShareModal = useCallback(() => {
        setShowScreenShareModal(false)
    }, [])

    const handleClickScreenShareButton = async () => {
        if (props.currentLivestream.mode === "desktop") {
            return await setDesktopMode("default", props.streamerId)
        }
        setShowScreenShareModal(true)
    }

    const handleScreenShare = useCallback(async (optimizationMode = "detail") => {
        setOptimizationMode(optimizationMode)
        await setDesktopMode(props.currentLivestream.mode === "desktop" ? "default" : "desktop", props.streamerId)
    }, [optimizationMode, props.currentLivestream?.mode, props.streamerId])


    const sharingContent = () => (props.currentLivestream.mode === 'presentation' || props.currentLivestream.mode === 'desktop')

    return (
        <Fragment>
            <div className={classes.blackFrame}>
                <div>
                    <CurrentSpeakerDisplayer
                        isPlayMode={false}
                        smallScreenMode={props.currentLivestream.mode === 'presentation' || props.currentLivestream.mode === 'desktop'}
                        speakerSwitchModeActive={isMainStreamer}
                        localId={props.streamerId}
                        localStream={localMediaStream}
                        speakerSource={speakerSource}
                        attachSinkId={attachSinkId}
                        streams={externalMediaStreams}
                        currentSpeaker={props.currentLivestream.currentSpeakerId}
                        setRemovedStream={setRemovedStream}
                        {...props}
                        muted={false}
                    />
                </div>
                {sharingContent() &&
                <SmallStreamerVideoDisplayer
                    livestreamId={props.currentLivestream.id}
                    presentation={props.currentLivestream.mode === 'presentation'}
                    showMenu={props.showMenu}
                    externalMediaStreams={externalMediaStreams}
                    isLocalScreen={screenSharingMode}
                    attachSinkId={attachSinkId}
                    presenter={true}/>}
                <VideoControlsContainer
                    currentLivestream={props.currentLivestream}
                    viewer={props.viewer}
                    streamerId={props.streamerId}
                    joining={!isMainStreamer}
                    handleClickScreenShareButton={handleClickScreenShareButton}
                    localMediaStream={localMediaStream}
                    setLocalMediaStream={setLocalMediaStream}
                    isMainStreamer={isMainStreamer}
                    showSettings={showSettings}
                    setShowSettings={setShowSettings}
                />
                <WifiIndicator
                    uplink={networkQuality.uplinkNetworkQuality}
                    downlink={networkQuality.downlinkNetworkQuality}
                />
            </div>
            <SettingsModal open={showSettings} close={() => setShowSettings(false)}
                           streamId={props.streamerId}
                           devices={devices} localStream={localMediaStream}
                           displayableMediaStream={displayableMediaStream}
                           audioSource={audioSource} updateAudioSource={updateAudioSource}
                           videoSource={videoSource} updateVideoSource={updateVideoSource} audioLevel={audioLevel}
                           speakerSource={speakerSource} setSpeakerSource={updateSpeakerSource}
                           attachSinkId={attachSinkId}/>
            <StreamPreparationModalV2 readyToConnect={Boolean(props.currentLivestream && props.currentLivestream.id)}
                audioSource={audioSource} updateAudioSource={updateAudioSource}
                videoSource={videoSource} updateVideoSource={updateVideoSource}
                speakerSource={speakerSource} setSpeakerSource={updateSpeakerSource}
                audioLevel={audioLevel} streamerConnected={streamerConnected}
                streamerReady={streamerReady} setStreamerReady={setStreamerReady}
                localStream={displayableMediaStream}
                connectionEstablished={connectionEstablished}
                isTest={props.currentLivestream.test} viewer={props.viewer}
                handleOpenDemoIntroModal={handleOpenDemoIntroModal}
                attachSinkId={attachSinkId} devices={devices}
                setConnectionEstablished={setConnectionEstablished} errorMessage={errorMessage}
                isStreaming={isStreaming}/>
            <LoadingModal agoraRtcStatus={agoraRtcStatus} />
            <ErrorModal agoraRtcStatus={agoraRtcStatus} agoraRtmStatus={agoraRtmStatus} />
            <ScreenShareModal
                open={showScreenShareModal}
                handleClose={handleCloseScreenShareModal}
                handleScreenShare={handleScreenShare}
            />
            <DemoIntroModal livestreamId={props.currentLivestream.id}
                            open={showDemoIntroModal}
                            handleClose={handleCloseDemoIntroModal}/>
            <DemoEndModal open={isOpen(17)} handleClose={handleCloseDemoEndModal}/>
        </Fragment>
    );
}

export default withFirebasePage(VideoContainer);