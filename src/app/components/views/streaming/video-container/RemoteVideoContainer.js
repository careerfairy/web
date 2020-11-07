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

    const {tutorialSteps, setTutorialSteps, getActiveTutorialStepKey, handleConfirmStep} = useContext(TutorialContext);
    const videoElement = useRef({ current: {} });
    console.log("videoElement", videoElement);

    const [canPlay, setCanPlay] = useState(false);
    const [stoppedByUserAgent, setStoppedByUserAgent] = useState(false);

    const activeStep = getActiveTutorialStepKey();

    useEffect(() => {
        if (props.stream.streamId === 'demoStream') {
            videoElement.current.src = props.stream.url;
            videoElement.current.loop = true;
            videoElement.current.play();
        } else {
            videoElement.current.srcObject = props.stream.stream;
        }
    },[props.stream.streamId]);

    useEffect(() => {
        if (!props.isPlayMode) {
            props.attachSinkId(videoElement.current, props.speakerSource)
        }
    },[props.speakerSource])

    useEffect(() => {
        if (videoElement.current && videoElement.current.srcObject && videoElement.current.paused) {
            if (props.showVideoButton && !props.showVideoButton.muted && !props.showVideoButton.paused) {
                videoElement.current.play().catch( e => {

                    props.setShowVideoButton({ paused: false, muted: true });
                });
            } else if (props.showVideoButton && props.showVideoButton.muted && !props.showVideoButton.paused) {
                videoElement.current.muted = true;
                videoElement.current.play().catch(e => {
                    videoElement.current.muted = false;
                    props.setShowVideoButton({ paused: true, muted: false });
                });
            } else {
                videoElement.current.play().then(() => {
                    setStoppedByUserAgent(false);
                }).catch(e => {
                    setStoppedByUserAgent(true)
                });
            }       
        }
    },[videoElement, videoElement.current.srcObject, props.showVideoButton]);

    useEffect(() => {
        if (props.unmute) {
            videoElement.current.muted = false;
        }
    },[props.unmute])

    useEffect(() => {
        if (props.play) {
            playVideo();
        }
    },[props.play])

    function playVideo() {
        videoElement.current.play().then(() => {
            setStoppedByUserAgent(false);
        }).catch((e) => console.log("Video Error:", e));
    }

    function handleVideoError(error) {
        handleVideoLoss();
        throw error;
    }

    function handleVideoLoss() {
        if (videoElement.current.srcObject && !videoElement.current.srcObject.active) {
            props.removeStreamFromExternalMediaStreams(props.stream.streamId)
        }
    }

    function handleVideoError(error) {
        handleVideoLoss()
        throw error;
    }

    useEffect(() => {
        if (videoElement && videoElement.current && videoElement.current.srcObject && !videoElement.current.srcObject.active) {
            props.removeStreamFromExternalMediaStreams(props.stream.streamId)
        }
    }, [videoElement.current]);

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
                open={activeStep === 11 && props.stream.type === 'demo'}>
                <div className='videoContainer' style={{ height: props.height }}>
                    <video id='videoElement' ref={videoElement} width={ '100%' } onCanPlay={() => setCanPlay(true) } controls={false} muted={props.muted} onEnded={(e) => handleVideoError(e)} onError={handleVideoLoss} onSuspend={handleVideoLoss} playsInline>
                    </video>
                    <div className={ 'loader ' + (canPlay ? 'hidden' : '')}>
                        <div style={{ position: 'absolute', width: '30%', maxWidth: '30px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                            <CircularProgress style={{ maxWidth: '30px', height: 'auto'}} />
                        </div>
                    </div>
                    <div className={ 'loader clickable ' + (stoppedByUserAgent ? '' : 'hidden')} onClick={(e) => {playVideo(); e.preventDefault();}}>
                        <Icon name='play' size='big' style={{ color: 'white', width: '30%', maxWidth: '80px', height: 'auto', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}} />
                    </div>
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