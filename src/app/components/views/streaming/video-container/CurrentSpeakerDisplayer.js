import React, {useEffect, Fragment, useRef, useState} from 'react';
import {Grid} from "semantic-ui-react";
import RemoteVideoContainer from './RemoteVideoContainer';

function StreamerVideoDisplayer(props) {

    const localVideoRef = useRef(null);
    const [localStream, setLocalStream] = useState(null);
    
    useEffect(() => {
        if (!props.isPlayMode && !localStream && props.mediaConstraints) {
            navigator.mediaDevices.getUserMedia(props.mediaConstraints).then( stream => {
                setLocalStream(stream);
            });
        }
    },[props.mediaConstraints, localVideoRef.current]);

    useEffect(() => {
        if (!props.isPlayMode && localStream && !localVideoRef.current.srcObject) {
            localVideoRef.current.srcObject = localStream;
        }
    },[localStream]);

    function getVideoContainerWidth(streamId) {
        if (streamId === props.currentSpeaker) {
            return 16;
        }
        if (props.isPlayMode) {
            return props.streams.length > 1 ? 8 : 16;
        } else {
            return props.streams.length > 0 ? 8 : 16;
        }
    }

    function getVideoContainerHeight() {
        if (!props.isPlayMode) {
            return props.streams.length > 1 ? 'calc(50vh - 37.5px)' : 'calc(100vh - 75px)';
        } else {
            return props.streams.length > 2 ? 'calc(50vh - 80px)' : 'calc(100vh - 160px)';
        }
    } 

    let externalVideoElements = props.streams.map( (stream, index) => {
        return (
            <div className={ stream.streamId === props.currentSpeaker ? 'speaker-video' : 'four wide column'} width={getVideoContainerWidth(stream.streamId)} style={{ padding: 0, border: index === 0 ? '2px solid blue' : '2px solid red'}} key={stream.streamId}>
                <RemoteVideoContainer stream={stream} length={props.streams.length} height={stream.streamId === props.currentSpeaker ? 'calc(80vh - 160px)' : '20vh' } index={index}/>
                <style jsx>{`
                    .speaker-video {
                        position: absolute;
                        top: 20vh;
                        left: 0;
                        width: 100%;
                        height: calc(80vh - 160px);
                    }       
                `}</style>
            </div>
        );
    });

    if (!props.isPlayMode) {
        let localVideoElement =
            <Grid.Column width={getVideoContainerWidth()} style={{ padding: 0 }} key={"localVideoId"}>
                <div className='video-container' style={{ height: getVideoContainerHeight() }}>
                    <video id="localVideo" ref={localVideoRef} muted autoPlay width={ props.streams.length > 1 ? '' : '100%' } style={{ right: (props.streams.length > 0) ? '0' : '', bottom: (props.streams.length > 1) ? '0' : '' }}></video> 
                </div>
                <style jsx>{`
                    .video-container {
                        position: relative;
                        background-color: black;
                        width: 100%; 
                        margin: 0 auto;
                        z-index: -9999;
                    }

                    #localVideo {
                        position: absolute;
                        top: 50%;
                        transform: translateY(-50%);
                        max-height: 100%;
                        max-width: 100%;
                        height: auto;
                        z-index: 9900;
                        background-color: black;
                    }
            `}</style>
            </Grid.Column>;

        externalVideoElements.unshift(localVideoElement);
    }

    return (
        <Fragment>
            <div className='relative-container'>
                <Grid style={{ margin: '0', border: '2px solid green', height: '20vh' }} centered>         
                    { externalVideoElements }
                </Grid> 
            </div>             
            <style jsx>{`
                .relative-container {
                    position: relative;
                    border: 2px solid pink;
                    height: 100%;
                    min-height: calc(100vh - 85px);
                }
                
                .hidden {
                    display: none;
                }
          `}</style>
        </Fragment>
    );
}

export default StreamerVideoDisplayer;