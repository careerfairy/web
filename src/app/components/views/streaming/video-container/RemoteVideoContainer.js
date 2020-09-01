import React, {useState, useEffect, useRef} from 'react';
import {Icon, Image} from "semantic-ui-react";

function RemoteVideoContainer(props) {

    const videoElement = useRef(null);

    const [canPlay, setCanPlay] = useState(false);

    useEffect(() => {
        videoElement.current.srcObject = props.stream.stream;
    },[props.stream]);

    return (
        <div>
            <div className='videoContainer' style={{ height: props.height }}>
                <video id='videoElement' ref={videoElement} width={ '100%' } onCanPlay={() => setCanPlay(true) } controls={props.isPlayMode} muted={props.muted} autoPlay playsInline>
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
          `}</style>
        </div>
    );
}

export default RemoteVideoContainer;