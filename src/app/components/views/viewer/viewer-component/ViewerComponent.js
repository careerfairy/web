import React, {Fragment, useCallback, useEffect, useState} from 'react';
import {withFirebasePage} from 'context/firebase';
import useAgoraAsStreamer from 'components/custom-hook/useAgoraAsStreamer';
import CurrentSpeakerDisplayer from 'components/views/streaming/video-container/CurrentSpeakerDisplayer';
import SmallStreamerVideoDisplayer from 'components/views/streaming/video-container/SmallStreamerVideoDisplayer';
import useDevices from 'components/custom-hook/useDevices';
import useMediaSources from 'components/custom-hook/useMediaSources';
import VideoControlsContainer from 'components/views/streaming/video-container/VideoControlsContainer';
import {useAuth} from 'HOCs/AuthProvider';
import {v4 as uuidv4} from 'uuid';
import {makeStyles} from "@material-ui/core/styles";
import SettingsModal from "../../streaming/video-container/SettingsModal";
import {Typography} from '@material-ui/core';
import ScreenShareModal from "../../streaming/video-container/ScreenShareModal";
import LoadingModal from 'components/views/streaming/modal/LoadingModal';
import ErrorModal from 'components/views/streaming/modal/ErrorModal';

const useStyles = makeStyles(theme => ({
    waitingOverlay: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: theme.palette.type === "dark" ? theme.palette.common.black : theme.palette.background.paper,
        zIndex: '9999',
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    waitingText: {
        fontSize: '1.1em',
        fontWeight: '700',
        color: theme.palette.primary.main,
        textAlign: 'center',
        padding: theme.spacing(0, 3)
    }
}))

function ViewerComponent(props) {
    const classes = useStyles()
    const [showSettings, setShowSettings] = useState(false);
    const [streamerId, setStreamerId] = useState(null);
    const [showScreenShareModal, setShowScreenShareModal] = useState(false);
    const [optimizationMode, setOptimizationMode] = useState("detail");

    const {userData, authenticatedUser} = useAuth();

    const streamerReady = true;

    const screenSharingMode = (props.currentLivestream.screenSharerId === authenticatedUser?.email &&
        props.currentLivestream.mode === 'desktop') ? optimizationMode : "";

    const {externalMediaStreams, localMediaStream, agoraRtcStatus, agoraRtmStatus} =
        useAgoraAsStreamer(
            streamerReady,
            !props.handRaiseActive,
            'localVideo',
            screenSharingMode,
            props.livestreamId,
            streamerId,
            true
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
    } = useMediaSources(devices, authenticatedUser?.email, localMediaStream, !streamerReady || showSettings);

    useEffect(() => {
        if (props.currentLivestream) {
            if (props.currentLivestream.test) {
                setStreamerId(uuidv4());
            } else if (authenticatedUser?.email) {
                setStreamerId(authenticatedUser.email)
            }
        }
    }, [props.currentLivestream, authenticatedUser])

    useEffect(() => {
        if (props.handRaiseActive && agoraRtcStatus && agoraRtcStatus.msg === "RTC_STREAM_PUBLISHED") {
            if (props.currentLivestream) {
                if (props.currentLivestream.test) {
                    props.firebase.updateHandRaiseRequest(props.currentLivestream.id, 'streamerEmail', "connected");
                } else {
                    props.firebase.updateHandRaiseRequest(props.currentLivestream.id, authenticatedUser.email, "connected");
                }
            }
        }
    }, [agoraRtcStatus])


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

    const setDesktopMode = async (mode, initiatorId) => {
        let screenSharerId = mode === 'desktop' ? initiatorId : props.currentLivestream.screenSharerId;
        await props.firebase.setDesktopMode(props.currentLivestream.id, mode, screenSharerId);
    }

    const shareDesktopOrSlides = () => (props.currentLivestream.mode === 'presentation' || props.currentLivestream.mode === 'desktop')

    const handleCloseScreenShareModal = useCallback(() => {
        setShowScreenShareModal(false)
    }, [])

    const handleClickScreenShareButton = async () => {
        if (props.currentLivestream.mode === "desktop") {
            return await setDesktopMode("default", authenticatedUser.email)
        }
        setShowScreenShareModal(true)
    }

    const handleScreenShare = useCallback(async (optimizationMode = "detail") => {
        setOptimizationMode(optimizationMode)
        await setDesktopMode(props.currentLivestream.mode === "desktop" ? "default" : "desktop", authenticatedUser.email)
    }, [props.currentLivestream?.mode, optimizationMode, props.streamerId])

    if (!props.currentLivestream) {
        return null;
    }

    return (
        <div>
            <CurrentSpeakerDisplayer isPlayMode={!props.handRaiseActive}
                                     smallScreenMode={props.currentLivestream.mode === 'presentation' || props.currentLivestream.mode === 'desktop'}
                                     speakerSwitchModeActive={false} localStream={null} attachSinkId={attachSinkId}
                                     streams={externalMediaStreams} localId={props.streamerId}
                                     currentSpeaker={props.currentLivestream.currentSpeakerId}
                                     muted={!props.currentLivestream.hasStarted} {...props}/>
            {shareDesktopOrSlides() &&
            <SmallStreamerVideoDisplayer
                livestreamId={props.currentLivestream.id}
                presentation={props.currentLivestream.mode === 'presentation'}
                showMenu={props.showMenu}
                externalMediaStreams={externalMediaStreams}
                isLocalScreen={false}
                attachSinkId={attachSinkId}
                {...props}
                presenter={false}/>}
            {props.handRaiseActive &&
            <Fragment>
                <VideoControlsContainer
                    currentLivestream={props.currentLivestream}
                    viewer={true}
                    streamerId={authenticatedUser.email}
                    joining={true}
                    localMediaStream={localMediaStream}
                    handleClickScreenShareButton={handleClickScreenShareButton}
                    isMainStreamer={false}
                    showSettings={showSettings}
                    setShowSettings={setShowSettings}
                />
                <SettingsModal open={showSettings} close={() => setShowSettings(false)}
                               streamId={authenticatedUser.email} devices={devices}
                               localStream={localMediaStream} displayableMediaStream={displayableMediaStream}
                               audioSource={audioSource} updateAudioSource={updateAudioSource}
                               videoSource={videoSource} updateVideoSource={updateVideoSource} audioLevel={audioLevel}
                               speakerSource={speakerSource} setSpeakerSource={updateSpeakerSource}
                               attachSinkId={attachSinkId}/>
                <ScreenShareModal
                    open={showScreenShareModal}
                    handleClose={handleCloseScreenShareModal}
                    handleScreenShare={handleScreenShare}
                />
                <LoadingModal agoraRtcStatus={agoraRtcStatus} />
                <ErrorModal agoraRtcStatus={agoraRtcStatus} agoraRtmStatus={agoraRtmStatus} />
            </Fragment>
            }

            {!props.currentLivestream.hasStarted &&
            <div className={classes.waitingOverlay}>
                <Typography className={classes.waitingText}>
                    {props.currentLivestream.test ? 'The streamer has to press Start Streaming to be visible to students' : 'Thank you for joining!'}
                </Typography>
            </div>}
        </div>
    );
}

export default withFirebasePage(ViewerComponent);