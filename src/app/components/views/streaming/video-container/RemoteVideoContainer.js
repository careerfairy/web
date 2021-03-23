import {Tooltip} from '@material-ui/core';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
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
        zIndex: 9901
    },
    audioMuted: {
        position: "absolute",
        bottom: 10,
        right: 10,
        zIndex: 9902
    },
    mutedOverlayContent: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
    },
    videoWrapper: {
        "& video": {
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            maxHeight: "100%",
            maxWidth: "100%",
            // zIndex: 9900,
            backgroundColor: "black",
            // objectFit: "contain !important",
            // [theme.breakpoints.down("xs")]: {
            //     objectPosition: props => props.isScreenShareVideo ? "top" : "center",
            // }
        },
    }
}))

function RemoteVideoContainer(props) {

    const {getActiveTutorialStepKey, handleConfirmStep} = useContext(TutorialContext);
    const activeStep = getActiveTutorialStepKey();
    const videoElement = useRef({current: {}});

    const isScreenShareVideo = props.stream.streamId.includes("screen");
    const classes = useStyles({isScreenShareVideo})


    useEffect(() => {
        if (props.stream.streamId === 'demoStream') {
            generateDemoHandRaiser()
        } else {
            if (!props.stream.stream.isPlaying()) {
                props.stream.stream.play(props.stream.streamId, {fit: isScreenShareVideo ? 'contain' : 'cover'}, err => {
                    if (err) {
                        props.setShowVideoButton({paused: false, muted: true});
                    }
                });
            }
        }
    }, [props.stream.streamId]);

    useEffect(() => {
        if (!props.isPlayMode) {
            let audioElement = document.getElementById(`audio${props.stream.streamId}`)
            props.attachSinkId(audioElement, props.speakerSource)
        }
    }, [props.speakerSource])

    useEffect(() => {
        if (props.unmute) {
            props.stream.stream.play(props.stream.streamId, {muted: false});
        }
    }, [props.unmute])

    useEffect(() => {
        if (props.play) {
            playVideo();
        }
    }, [props.play])

    useEffect(() => {
        if (props.muted) {
            props.stream?.stream?.muteAudio()
        } else {
            props.stream?.stream?.unmuteAudio()
        }
    }, [props.muted])

    useEffect(() => {
        if (props.stream?.stream?.audio === false && props.stream?.stream?.video === false) {
            props.setRemovedStream(props.stream.streamId)
        }
    }, [props.stream?.stream?.audio, props.stream?.stream?.video])

    function generateDemoHandRaiser() {
        let video = document.createElement('video');
        const videoContainer = document.querySelector('#' + props.stream.streamId);
        videoContainer.appendChild(video);
        video.src = props.stream.url;
        video.loop = true;
        video.play();
    }

    function playVideo() {
        if (!props.stream.stream.isPlaying()) {
            props.stream.stream.play(props.stream.streamId, {
                fit: isScreenShareVideo ? 'contain' : 'cover',
                muted: true
            }, err => {
                if (err) {
                    props.setShowVideoButton({paused: false, muted: true});
                }
            });
        }
    }

    const speaker = !isScreenShareVideo ? props.currentLivestream.liveSpeakers.find(speaker => speaker.speakerUuid === props.stream.streamId) : null;

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
            open={activeStep === 11 && props.stream.streamId === 'demoStream'}>
            <div className={classes.videoContainer} style={{height: props.height}}>
                <div ref={videoElement} id={props.stream.streamId} className={classes.videoWrapper}
                     style={{width: '100%', height: '100%'}}/>
                {
                    speaker &&
                    <SpeakerInfoOverlay speaker={speaker} small={props.small}/>
                }
                {
                    props.stream.videoMuted &&
                    <div className={classes.mutedOverlay}>
                        <div className={classes.mutedOverlayContent}>
                            <div>
                                <img src={props.currentLivestream.companyLogoUrl} className={classes.companyIcon}/>
                            </div>
                            <Tooltip title={'The streamer has turned the camera off'}>
                                <VideocamOffIcon fontSize='large' color='error'/>
                            </Tooltip>
                        </div>
                    </div>
                }
                {
                    props.stream.audioMuted &&
                    <div className={classes.audioMuted}>
                        <Tooltip title={'The streamer has muted his microphone'}>
                            <VolumeOffIcon fontSize='large' color='error'/>
                        </Tooltip>
                    </div>
                }
                {
                    (props.stream.fallbackToAudio && !props.stream.videoMuted) &&
                    <div className={classes.mutedOverlay}>
                        <div className={classes.mutedOverlayContent}>
                            <div>
                                <img src={props.currentLivestream.companyLogoUrl} className={classes.companyIcon}/>
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
}

export default RemoteVideoContainer;