import { CircularProgress, Tooltip } from '@material-ui/core';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import SignalCellularConnectedNoInternet2BarIcon from '@material-ui/icons/SignalCellularConnectedNoInternet2Bar';
import React, {useState, useEffect, useRef, useContext} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Icon, Image} from "semantic-ui-react";
import {
    TooltipButtonComponent,
    TooltipText,
    TooltipTitle,
    WhiteTooltip
} from "materialUI/GlobalTooltips";
import TutorialContext from "context/tutorials/TutorialContext";

const useStyles = makeStyles(theme => ({
    companyIcon: {
        maxWidth: "75%",
        margin: "10px"
    },
}))

function RemoteVideoContainer(props) {

    const {getActiveTutorialStepKey, handleConfirmStep} = useContext(TutorialContext);
    const activeStep = getActiveTutorialStepKey();
    const videoElement = useRef({ current: {} });

    const classes = useStyles()


    useEffect(() => {
        if (props.stream.streamId === 'demoStream') {
            generateDemoHandRaiser()         
        } else {
            if (!props.stream.stream.isPlaying()) {
                props.stream.stream.play(props.stream.streamId, { fit: props.stream.streamId.includes("screen") ? 'contain' : 'cover' }, err => {
                    if (err) {
                        props.setShowVideoButton({ paused: false, muted: true });
                    }
                });
            }       
        }
    },[props.stream.streamId]);

    useEffect(() => {
        if (!props.isPlayMode) {
            props.attachSinkId(videoElement.current, props.speakerSource)
        }
    },[props.speakerSource])

    useEffect(() => {
        if (props.unmute) {
            props.stream.stream.play(props.stream.streamId, { muted: false });
        }
    },[props.unmute])

    useEffect(() => {
        if (props.play) {
            playVideo();
        }
    },[props.play])

    useEffect(() => {
        if (props.muted) { 
            props.stream?.stream?.muteAudio()
        } else {
            props.stream?.stream?.unmuteAudio()
        }
    },[props.muted])

    useEffect(() => {
        if (props.stream?.stream?.audio === false && props.stream?.stream?.video === false) {
            props.setRemovedStream(props.stream.streamId)
        }
    },[props.stream?.stream?.audio, props.stream?.stream?.video])

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
            props.stream.stream.play(props.stream.streamId, { fit: props.stream.streamId.includes("screen") ? 'contain' : 'cover', muted: true }, err => {
                if (err) {
                    props.setShowVideoButton({ paused: false, muted: true });
                } else {
                    debugger;
                }
            });
        }
    }

    return (
        <>
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
                <div className='videoContainer' style={{ height: props.height }}>
                    <div ref={videoElement} id={props.stream.streamId} style={{ width: '100%', height: '100%' }}/>
                    { props.stream.videoMuted && 
                        <div className='muted-overlay'>
                            <div className='muted-overlay-content'>
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
                        <div className='audio-muted'>
                            <Tooltip title={'The streamer has muted his microphone'}>
                                <VolumeOffIcon fontSize='large' color='error'/>
                            </Tooltip>
                        </div>
                    }
                    { (props.stream.fallbackToAudio && !props.stream.videoMuted) && 
                        <div className='muted-overlay'>
                            <div className='muted-overlay-content'>
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
            <style jsx>{`
                .hidden {
                    display: none;
                }

               .videoContainer {
                    position: relative;
                    background-color: black;
                    width: 100%;
                    height: 10vh;
                    margin: 0 auto;
                }

                #videoElement {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    max-height: 100%;
                    max-width: 100%;
                    z-index: 9900;
                    background-color: black;
                }

                .loader {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    max-height: 100%;
                    width: 100%;
                    padding-top: 54%;
                    background-color: rgb(40,40,40);
                    z-index: 9901;
                }

                .clickable {
                    cursor: pointer;
                }

                .muted-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: white;
                    z-index: 9901;
                }

                .muted-overlay-content {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }

                .audio-muted {
                    position: absolute;
                    bottom: 10px;
                    left: 10px;
                    z-index: 9902;
                }
          `}</style>
        </>
    );
}

export default RemoteVideoContainer;