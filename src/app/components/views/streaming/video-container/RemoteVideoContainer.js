import React, {useState, useEffect, useRef} from 'react';
import {Icon, Image} from "semantic-ui-react";

function RemoteVideoContainer(props) {

    const videoElement = useRef(null);
    const [muted, setMuted] = useState(false);

    useEffect(() => {
        videoElement.current.srcObject = props.stream.stream;
    },[props.stream]);

    useEffect(() => {
        setMuted(props.muted);
    },[props.muted]);

    useEffect(() => {
        setTimeout(() => {
            playVideo().catch( error => {
                console.log(error);
            })
        }, 500);
    }, []);

    function playVideo() {
        return document.getElementById('videoElement' + props.stream.streamId).play();
    }

    return (
        <div>
            <div className='videoContainer' style={{ height: props.height }}>
                <video id={'videoElement' + props.stream.streamId } className='videoElement' ref={videoElement} width={ '100%' } controls={false} muted={muted} playsInline/>
                <Icon name={muted ? 'microphone slash' : 'microphone'} onClick={() => setMuted(!muted)} style={{ fontSize: '200%', position: 'absolute', bottom: '5%', right: '5%', color: muted ? 'red' : 'rgb(0, 210, 170)', zIndex: '9903', cursor: 'pointer'}}/>
            </div>           
            <style jsx>{`
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
          `}</style>
        </div>
    );
}

export default RemoteVideoContainer;