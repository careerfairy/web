import React, {Fragment, useCallback, useEffect, useState} from 'react';
import {withFirebasePage} from 'context/firebase';
import useAgoraAsStreamer from 'components/custom-hook/useAgoraAsStreamer';
import CurrentSpeakerDisplayer from 'components/views/streaming/video-container/CurrentSpeakerDisplayer';
import SmallStreamerVideoDisplayer from 'components/views/streaming/video-container/SmallStreamerVideoDisplayer';
import useDevices from 'components/custom-hook/useDevices';
import useMediaSources from 'components/custom-hook/useMediaSources';
import VideoControlsContainer from 'components/views/streaming/video-container/VideoControlsContainer';
import {useAuth} from 'HOCs/AuthProvider';
import {makeStyles} from "@material-ui/core/styles";
import SettingsModal from "../../streaming/video-container/SettingsModal";
import {Typography} from '@material-ui/core';
import ScreenShareModal from "../../streaming/video-container/ScreenShareModal";
import LoadingModal from 'components/views/streaming/modal/LoadingModal';
import ErrorModal from 'components/views/streaming/modal/ErrorModal';
import useStreamRef from "../../../custom-hook/useStreamRef";
import EmoteButtons from "../EmoteButtons";
import {useDispatch, useSelector} from "react-redux";
import {useRouter} from "next/router";
import * as actions from 'store/actions'
import useCurrentSpeaker from "../../../custom-hook/useCurrentSpeaker";

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
    const dispatch = useDispatch()
    const [showSettings, setShowSettings] = useState(false);
    const [showScreenShareModal, setShowScreenShareModal] = useState(false);
    const [optimizationMode, setOptimizationMode] = useState("detail");
    const streamRef = useStreamRef();
    const {query: {livestreamId}} = useRouter()
    const {authenticatedUser} = useAuth();
    const hasActiveRooms = useSelector(state => Boolean(state.firestore.ordered?.[`Active BreakoutRooms of ${livestreamId}`]?.length))
    const streamerReady = true;

    const screenSharingMode = (props.currentLivestream.screenSharerId === authenticatedUser?.email &&
        props.currentLivestream.mode === 'desktop') ? optimizationMode : "";

    const {externalUsers, localMediaStream, setLocalMediaStream, agoraRtcStatus, agoraRtmStatus, createEmote, joinedChannel} =
        useAgoraAsStreamer(
            streamerReady,
            !props.handRaiseActive,
            'localVideo',
            screenSharingMode,
            props.livestreamId,
            props.streamerId,
            true,
            "motion",
            props.setShowVideoButton
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
        if (props.handRaiseActive && agoraRtcStatus && agoraRtcStatus.msg === "RTC_STREAM_PUBLISHED") {
            if (props.currentLivestream) {
                if (props.currentLivestream.test) {
                    props.firebase.updateHandRaiseRequest(streamRef, 'streamerEmail', "connected");
                } else {
                    props.firebase.updateHandRaiseRequest(streamRef, authenticatedUser.email, "connected");
                }
            }
        }
    }, [agoraRtcStatus])

    useEffect(() => {
        if (joinedChannel && !props.isBreakout && !externalUsers?.length && hasActiveRooms) {
            const timout = setTimeout(function() { //Start the timer
            dispatch(actions.openViewerBreakoutModal())
            }, 3000) // Only open modal If no streams appear after 3 seconds

            return () => clearTimeout(timout) // Cancel opening modal if streams appear before 3 seconds
        }

    }, [Boolean(externalUsers?.length), props.isBreakout, hasActiveRooms, joinedChannel])

    const setDesktopMode = async (mode, initiatorId) => {
        let screenSharerId = mode === 'desktop' ? initiatorId : props.currentLivestream.screenSharerId;
        await props.firebase.setDesktopMode(streamRef, mode, screenSharerId);
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
        <React.Fragment>
            <EmoteButtons createEmote={createEmote}/>
            <CurrentSpeakerDisplayer isPlayMode={!props.handRaiseActive}
                                     smallScreenMode={props.currentLivestream.mode === 'presentation' || props.currentLivestream.mode === 'desktop'}
                                     speakerSwitchModeActive={false} localStream={null} 
                                     streams={externalUsers} localId={props.streamerId}
                                     isViewer={true}
                                     joinedChannel={joinedChannel}
                                     isBreakout={props.isBreakout}
                                     currentSpeaker={props.currentLivestream.currentSpeakerId}
                                     muted={!props.currentLivestream.hasStarted} {...props}/>
            {shareDesktopOrSlides() &&
            <SmallStreamerVideoDisplayer
                livestreamId={props.currentLivestream.id}
                presentation={props.currentLivestream.mode === 'presentation'}
                showMenu={props.showMenu}
                isStreamer={true}
                externalMediaStreams={externalUsers}
                isLocalScreen={false}
                isBreakout={props.isBreakout}
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
                    setLocalMediaStream={setLocalMediaStream}
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
                            />
                <ScreenShareModal
                    open={showScreenShareModal}
                    handleClose={handleCloseScreenShareModal}
                    handleScreenShare={handleScreenShare}
                />
                <LoadingModal agoraRtcStatus={agoraRtcStatus} />
                <ErrorModal agoraRtcStatus={agoraRtcStatus} agoraRtmStatus={agoraRtmStatus} />
            </Fragment>
            }
            {
            !props.currentLivestream.hasStarted &&
                <div className={classes.waitingOverlay}>
                    <Typography className={classes.waitingText}>
                        {props.currentLivestream.test ? 'The streamer has to press Start Streaming to be visible to students' : 'Thank you for joining!'}
                    </Typography>
                </div>
            }
        </React.Fragment>
    );
}

export default withFirebasePage(ViewerComponent);