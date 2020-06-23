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
                <video id='videoElement' ref={videoElement} width={ '100%' } controls={props.isPlayMode} autoPlay/>
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
                    left: 0;
                    transform: translateY(-50%);
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
               }
          `}</style>
        </div>
    );
}

export default RemoteVideoContainer;