import React, {useState, useEffect, useRef} from 'react';
import {Icon, Image} from "semantic-ui-react";

function RemoteVideoContainer(props) {

    const videoElement = useRef(null);

    const [canPlay, setCanPlay] = useState(false);
    const [showPlayButton, setShowPlayButton] = useState(false);

    useEffect(() => {
        videoElement.current.srcObject = props.stream.stream;
    },[props.stream.streamId]);

    useEffect(() => {
        if (videoElement.current && videoElement.current.paused) {
            if (showPlayButton) {
                videoElement.current.muted = true;
                videoElement.current.play();
            } else {
                videoElement.current.play().catch( e => {
                    setShowPlayButton(true);
                });
            }          
        }
    },[videoElement, showPlayButton]);

    function unmuteVideo() {
        videoElement.current.muted = false;
        setShowPlayButton(false);
    }

    return (
        <div>
            <div className='videoContainer' style={{ height: props.height }}>
                <video id='videoElement' ref={videoElement} width={ '100%' } onCanPlay={() => setCanPlay(true) } controls={false} muted={props.muted} playsInline>
                </video>
                <div className={ 'loader ' + (canPlay ? 'hidden' : '')}>
                    <Image src='/loader.gif' style={{ width: '30%', maxWidth: '80px', height: 'auto', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}} />
                </div>
                <div className={ 'playButtonContent ' + (showPlayButton ? '' : 'hidden')} onClick={unmuteVideo}>
                    <div className='playButton'>
                        <Icon name='volume up' style={{ fontSize: '3rem' }}/>
                        <div>Click to unmute</div>
                    </div>     
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

                .playButton {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    font-weight: 500;
                }

                .playButtonContent {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(10,10,10,0.4);
                    z-index: 9901;
                    cursor: pointer;
                }
          `}</style>
        </div>
    );
}

export default RemoteVideoContainer;