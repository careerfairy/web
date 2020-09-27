import React, {useState, useEffect, useRef} from 'react';
import {Icon, Image} from "semantic-ui-react";

function RemoteVideoContainer(props) {

    const videoElement = useRef(null);
    const [muted, setMuted] = useState(false);

    const [canPlay, setCanPlay] = useState(false);

    useEffect(() => {
        videoElement.current.srcObject = props.stream.stream;
    },[props.stream.streamId]);

    useEffect(() => {
        if (videoElement.current && videoElement.current.paused) {
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
                videoElement.current.play()
            }       
        }
    },[videoElement, props.showVideoButton]);

    useEffect(() => {
        if (props.unmute) {
            videoElement.current.muted = false;
        }
    },[props.unmute])

    useEffect(() => {
        if (props.play) {
            videoElement.current.play();
        }
    },[props.play])

    return (
        <div>
            <div className='videoContainer' style={{ height: props.height }}>
                <video id='videoElement' ref={videoElement} width={ '100%' } onCanPlay={() => setCanPlay(true) } controls={false} muted={props.muted} playsInline>
                </video>
                <div className={ 'loader ' + (canPlay ? 'hidden' : '')}>
                    <Image src='/loader.gif' style={{ width: '30%', maxWidth: '80px', height: 'auto', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}} />
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
                    z-index: 1000;
                }

                .videoElement {
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
          `}</style>
        </div>
    );
}

export default RemoteVideoContainer;