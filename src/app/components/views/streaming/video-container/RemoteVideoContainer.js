import React, {useState, useEffect, useRef} from 'react';
import {Icon, Image} from "semantic-ui-react";

function RemoteVideoContainer(props) {

    const videoElement = useRef(null);

    useEffect(() => {
        videoElement.current.srcObject = props.stream.stream;
    },[props.stream]);

    return (
        <div>
            <div className='videoContainer'  style={{ height: props.length > 1 ? '50vh' : '100vh' }}>
                <video id='videoElement' ref={videoElement}  width={ props.length > 1 ? '' : '100%' } style={{  left: (props.index % 2 === 0) ? '0' : '', right: (props.index % 2 === 1) ? '0' : '' }} autoPlay/>
            </div>           
            <style jsx>{`
               .videoContainer {
                    position: relative;
                    background-color: black;
                    width: 100%;
                    margin: 0 auto;
                    z-index: -9999;
               }

               #videoElement {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    max-height: 100%;
                    height: auto;
                    z-index: 9900;
                    background-color: black;
               }
          `}</style>
        </div>
    );
}

export default RemoteVideoContainer;