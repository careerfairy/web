import React, {Fragment, useRef, useState, useEffect} from 'react';
import {Grid} from "semantic-ui-react";
import RemoteVideoContainer from './RemoteVideoContainer';
import LivestreamPdfViewer from '../../../util/LivestreamPdfViewer';
import { useWindowSize } from '../../../custom-hook/useWindowSize';

function SmallStreamerVideoDisplayer(props) {

    const windowSize = useWindowSize();

    // const localVideoRef = useRef(null);

    // useEffect(() => {
    //     if (!props.isPlayMode && props.localStream) {
    //         localVideoRef.current.srcObject = props.localStream;
    //     }
    // },[props.localStream]);

    // let externalVideoElements = props.streams.map( (stream, index) => {
    //     return (
    //         <div style={{ width: '250px', height: '100%', display: 'inline-block'  }} key={stream.streamId}>
    //             <RemoteVideoContainer stream={stream} length={props.streams.length} height={'150px'} isPlayMode={true} index={index} muted={props.muted}/>
    //         </div>
    //     );
    // });

    // if (!props.isPlayMode) {
    //     let localVideoElement =
    //     <div style={{ width: '250px', height: '100%', display: 'inline-block' }} key={"localVideoId"}>
    //         <div className='video-container' style={{ height: '150px' }}>
    //             <video id="localVideo" ref={localVideoRef} muted autoPlay width={ props.streams.length > 1 ? '' : '100%' }></video> 
    //         </div>
    //         <style jsx>{`
    //             .video-container {
    //                 position: relative;
    //                 background-color: black;
    //                 width: 100%; 
    //                 margin: 0 auto;
    //                 z-index: 100;
    //             }

    //             #localVideo {
    //                 position: absolute;
    //                 top: 50%;
    //                 left: 0;
    //                 transform: translateY(-50%);
    //                 width: 100%;
    //                 height: 100%;
    //                 object-fit: cover;
    //             }
    //     `}</style>
    //     </div>;

    //     externalVideoElements.unshift(localVideoElement);
    // }

    return (
        <Fragment>
            <div style={{ position: 'absolute', top: '20vh', width: '100%', backgroundColor: 'rgb(30,30,30)'}}>
                <LivestreamPdfViewer livestreamId={props.livestreamId} presenter={props.presenter}/>
            </div>         
            <style jsx>{`
                .hidden {
                    display: none;
                }

                .relative-container {
                    position: relative;
                    height: 100%;
                    min-height: calc(100vh - 85px);
                }

                .relative-container-videos {
                    margin: 0;
                    background-color: rgb(30,30,30);
                    overflow-x: scroll;
                    overflow-y: hidden;
                    white-space: nowrap;
                    text-align: center;
                }
          `}</style>
        </Fragment>
    )
}

export default SmallStreamerVideoDisplayer;