import React, {useState, useEffect, useRef} from 'react';
import {Icon, Image} from "semantic-ui-react";

function RemoteVideoContainer(props) {

    const videoElement = useRef(null);

    useEffect(() => {
        videoElement.current.srcObject = props.stream.stream;
    },[props.stream]);

    return (
        <div>
            <div className='videoContainer' style={{ height: props.height }}>
                <video id='videoElement' ref={videoElement} width={ '100%' } controls={props.isPlayMode} muted={props.muted} autoPlay playsInline/>
            </div>           
            <style jsx>{`
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
          `}</style>
        </div>
    );
}

export default RemoteVideoContainer;