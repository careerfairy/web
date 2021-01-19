import { CircularProgress } from '@material-ui/core';
import React, {useState, useEffect, useRef, useContext} from 'react';
import {Icon, Image} from "semantic-ui-react";
import {
    TooltipButtonComponent,
    TooltipText,
    TooltipTitle,
    WhiteTooltip
} from "materialUI/GlobalTooltips";
import TutorialContext from "context/tutorials/TutorialContext";

function RemoteVideoContainer(props) {

    const {getActiveTutorialStepKey, handleConfirmStep} = useContext(TutorialContext);
    const videoElement = useRef({ current: {} });

    const [stoppedByUserAgent, setStoppedByUserAgent] = useState(false);

    const activeStep = getActiveTutorialStepKey();

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
            props.stream.stream.play(props.stream.streamId, { fit: props.stream.streamId.includes("screen") ? 'contain' : 'cover' }, err => {
                if (!err) {
                    setStoppedByUserAgent(false);
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
                    {/* <div className={ 'loader ' + (canPlay ? 'hidden' : '')}>
                        <div style={{ position: 'absolute', width: '30%', maxWidth: '30px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                            <CircularProgress style={{ maxWidth: '30px', height: 'auto'}} />
                        </div>
                    </div>
                    <div className={ 'loader clickable ' + (stoppedByUserAgent ? '' : 'hidden')} onClick={(e) => {playVideo(); e.preventDefault();}}>
                        <Icon name='play' size='big' style={{ color: 'white', width: '30%', maxWidth: '80px', height: 'auto', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}} />
                    </div> */}
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
          `}</style>
        </>
    );
}

export default RemoteVideoContainer;