import {Tooltip} from '@material-ui/core';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import VolumeOffIcon from '@material-ui/icons/MicOff';
import SignalCellularConnectedNoInternet2BarIcon from '@material-ui/icons/SignalCellularConnectedNoInternet2Bar';
import React, {useEffect, useRef, useContext} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {
    TooltipButtonComponent,
    TooltipText,
    TooltipTitle,
    WhiteTooltip
} from "materialUI/GlobalTooltips";
import TutorialContext from "context/tutorials/TutorialContext";
import SpeakerInfoOverlay from './SpeakerInfoOverlay';

const mutedOverlayZIndex = 9901

const useStyles = makeStyles(theme => ({
    companyIcon: {
        maxWidth: "75%",
        margin: "10px"
    },
    videoContainer: {
        position: "relative",
        backgroundColor: "black",
        width: "100%",
        height: "10vh",
        margin: "0 auto",

    },
    mutedOverlay: {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        zIndex: mutedOverlayZIndex
    },
    audioMuted: {
        position: "absolute",
        bottom: 10,
        right: 10,
        zIndex: mutedOverlayZIndex + 1
    },
    mutedOverlayContent: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
    },
    svgShadow: {
        filter: `drop-shadow(0px 0px 2px rgba(0,0,0,0.4))`
    },
}))

const RemoteVideoContainer = ({
                                  attachSinkId,
                                  currentLivestream,
                                  height,
                                  isPlayMode,
                                  muted,
                                  play,
                                  setRemovedStream,
                                  small,
                                  speakerSource,
                                  stream,
                                  unmute
                              }) => {

    const {getActiveTutorialStepKey, handleConfirmStep} = useContext(TutorialContext);
    const activeStep = getActiveTutorialStepKey();
    const videoElement = useRef({current: {}});

    const isScreenShareVideo = stream.uid.includes("screen");
    const classes = useStyles({isScreenShareVideo})


    useEffect(() => {
        if (stream.uid === 'demoStream') {
            generateDemoHandRaiser()
        } else {
            if (stream.videoTrack && !stream.videoTrack.isPlaying) {
                stream.videoTrack?.play(stream.uid, {fit: isScreenShareVideo ? 'contain' : 'cover'});
                // stream.stream.audioTrack?.play();
            }
        }
    }, [stream.uid, stream.videoTrack]);

    useEffect(() => {
        if (!isPlayMode) {
            let audioElement = document.getElementById(`audio${stream.uid}`)
            if (audioElement) {
                attachSinkId(audioElement, speakerSource)
            }
        }
    }, [speakerSource])

    useEffect(() => {
        if (unmute) {
            stream.stream.audioTrack.play();
        }
    }, [unmute])

    useEffect(() => {
        if (play) {
            playVideo();
        }
    }, [play])

    useEffect(() => {
        if (muted) {
            stream?.stream?.audioTrack?.stop()
        } else {
            stream?.stream?.audioTrack?.play()
        }
    }, [muted])

    useEffect(() => {
        if (stream?.stream?.audio === false && stream?.stream?.video === false) {
            setRemovedStream(stream.streamId)
        }
    }, [stream?.stream?.audio, stream?.stream?.video])

    function generateDemoHandRaiser() {
        let video = document.createElement('video');
        const videoContainer = document.querySelector('#' + stream.uid);
        videoContainer.appendChild(video);
        video.src = stream.url;
        video.loop = true;
        video.play();
    }

    const speaker = !isScreenShareVideo ? currentLivestream.liveSpeakers.find(speaker => speaker.speakerUuid === stream.uid) : null;

    return (
        <WhiteTooltip
            placement="bottom"
            title={
                <React.Fragment>
                    <TooltipTitle>Hand Raise (3/5)</TooltipTitle>
                    <TooltipText>
                        Once connected, the viewer who raised their hand will appear as an additional streamer
                    </TooltipText>
                    {activeStep === 11 && < TooltipButtonComponent onConfirm={() => {
                        handleConfirmStep(11)
                    }} buttonText="Ok"/>}
                </React.Fragment>
            }
            open={activeStep === 11 && stream.uid === 'demoStream'}>
            <div className={classes.videoContainer} style={{height: height}}>
                <div ref={videoElement} id={stream.uid} className={classes.videoWrapper}
                     style={{width: '100%', height: '100%'}}/>
                {
                    speaker &&
                    <SpeakerInfoOverlay zIndex={mutedOverlayZIndex + 1} speaker={speaker} small={small}/>
                }
                {
                    !stream.videoTrack &&
                    <div className={classes.mutedOverlay}>
                        <div className={classes.mutedOverlayContent}>
                            <div>
                                <img src={currentLivestream?.companyLogoUrl} className={classes.companyIcon}/>
                            </div>
                            <Tooltip title={'The streamer has turned the camera off'}>
                                <VideocamOffIcon className={classes.svgShadow} fontSize='large' color='error'/>
                            </Tooltip>
                        </div>
                    </div>
                }
                {
                    !stream.audioTrack &&
                    <div className={classes.audioMuted}>
                        <Tooltip title={'The streamer has muted his microphone'}>
                            <VolumeOffIcon className={classes.svgShadow} fontSize='large' color='error'/>
                        </Tooltip>
                    </div>
                }
                {
                    (stream.fallbackToAudio && !stream.videoMuted) &&
                    <div className={classes.mutedOverlay}>
                        <div className={classes.mutedOverlayContent}>
                            <div>
                                <img src={currentLivestream?.companyLogoUrl} className={classes.companyIcon}/>
                            </div>
                            <Tooltip title={'Your connection is currently too weak to stream this video'}>
                                <SignalCellularConnectedNoInternet2BarIcon fontSize='large' color='error'/>
                            </Tooltip>
                        </div>
                    </div>
                }
            </div>
        </WhiteTooltip>
    );
};

export default RemoteVideoContainer;