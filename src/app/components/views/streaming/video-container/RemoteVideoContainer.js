import React, {useState, useEffect, useRef} from 'react';
import {Icon, Image} from "semantic-ui-react";

function RemoteVideoContainer(props) {

    const videoElement = useRef(null);

    useEffect(() => {
        videoElement.current.srcObject = props.stream.stream;
    },[props.stream]);

    return (
        <div>
            <div className='videoContainer'>
                <video id='videoElement' ref={videoElement}  width={ props.length > 1 ? '' : '100%' } autoPlay/>
            </div>           
            <style jsx>{`
               .videoContainer {
                    position: relative;
                    background-color: black;
                    width: 100%
                    margin: 0 auto;
                    z-index: -9999;
                    padding-top: 45%;
                    border: 2px solid white;
               }

               #videoElement {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    max-height: 100%;
                    max-width: 100%;
                    z-index: 9900;
                    background-color: black;
                    border: 2px solid yellow;
               }
          `}</style>
        </div>
    );
}

export default RemoteVideoContainer;