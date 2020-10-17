import React, {useState, useEffect, useRef} from 'react';
import {Icon, Image} from "semantic-ui-react";

function RemoteVideoContainer(props) {

    const videoElement = useRef({ current: {} });

    const [canPlay, setCanPlay] = useState(false);
    const [stoppedByUserAgent, setStoppedByUserAgent] = useState(false);

    useEffect(() => {
        videoElement.current.srcObject = props.stream.stream;
        if (!props.isPlayMode) {
            props.attachSinkId(videoElement.current, props.speakerSource)
        }
    },[props.stream.streamId]);

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

    function handleVideoLoss() {
        if (!videoElement.current.srcObject.active) {
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
        <div>
            <div className='videoContainer' style={{ height: props.height }}>
                <video id='videoElement' ref={videoElement} width={ '100%' } onCanPlay={() => setCanPlay(true) } controls={false} muted={props.muted} onEnded={handleVideoLoss} onError={(e) => handleVideoError(e)} onSuspend={handleVideoLoss} playsInline>
                </video>
                <div className={ 'loader ' + (canPlay ? 'hidden' : '')}>
                    <Image src='/loader.gif' style={{ width: '30%', maxWidth: '80px', height: 'auto', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}} />
                </div>
                <div className={ 'loader clickable ' + (stoppedByUserAgent ? '' : 'hidden')} onClick={(e) => {playVideo(); e.preventDefault();}}>
                    <Icon name='play' size='big' style={{ color: 'white', width: '30%', maxWidth: '80px', height: 'auto', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}} />
                </div>
            </div>           
            <style jsx>{`
                .hidden {
                    display: none;
                }

               .videoContainer {
                    position: relative;
                    background-color: black;
                    width: 100%;
                    margin: 0 auto;
                    z-index: 2000;
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
        </div>
    );
}

export default RemoteVideoContainer;