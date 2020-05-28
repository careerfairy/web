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

    function getVideoContainerHeight(streamId) {
        if (props.isPlayMode) {
            if (props.streams.length > 1) {
                return streamId === props.currentSpeaker ? 'calc(80vh - 160px)' : '20vh';
            } else {
                return 'calc(100vh - 160px)';
            }
        } else {
            if (props.streams.length > 0) {
                return streamId === props.currentSpeaker ? 'calc(80vh - 75px)' : '20vh';
            } else {
                return 'calc(100vh - 75px)';
            }
        }
    } 

    function getMinimizedSpeakersGridHeight() {
        if (props.isPlayMode) {
            return props.streams.length > 1 ? '20vh' : '0';
        } else {
            return props.streams.length > 0 ? '20vh' : '0';
        }
    } 

    function getVideoContainerClass(streamId) {
        if (props.isPlayMode) {
            if (props.streams.length > 1) {
                return streamId === props.currentSpeaker ? 'speaker-video' : 'four wide column';
            } else {
                return 'speaker-video-solo';
            }
        } else {
            if (props.streams.length > 0) {
                return streamId === props.currentSpeaker ? 'speaker-video' : 'four wide column';
            } else {
                return 'speaker-video-solo';
            }
        }
    }

    let externalVideoElements = props.streams.map( (stream, index) => {
        return (
            <div className={getVideoContainerClass(stream.streamId)} style={{ padding: 0 }} key={stream.streamId}>
                <RemoteVideoContainer stream={stream} height={getVideoContainerHeight(stream.streamId)} index={index}/>
                <style jsx>{`
                    .speaker-video {
                        position: absolute;
                        top: 20vh;
                        left: 0;
                        width: 100%;
                        height: calc(80vh - 160px);
                    }

                    .speaker-video-solo {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: calc(100vh - 160px);
                    }     
                `}</style>
            </div>
        );
    });

    if (!props.isPlayMode) {
        let localVideoElement =
            <div className={getVideoContainerClass(props.localId)} style={{ padding: 0 }} key={"localVideoId"}>
                <div className='video-container' style={{ height: getVideoContainerHeight(props.localId) }}>
                    <video id="localVideo" ref={localVideoRef} muted autoPlay width={ '100%' } style={{ right: (props.streams.length > 0) ? '0' : '', bottom: (props.streams.length > 1) ? '0' : '' }}></video> 
                </div>
                <style jsx>{`
                    .speaker-video {
                        position: absolute;
                        top: 20vh;
                        left: 0;
                        width: 100%;
                        height: calc(80vh - 160px);
                    } 

                    .speaker-video-solo {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: calc(100vh - 160px);
                    } 

                    .video-container {
                        position: relative;
                        background-color: black;
                        width: 100%; 
                        margin: 0 auto;
                        z-index: 2000;
                    }

                    #localVideo {
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
            </div>;

        externalVideoElements.unshift(localVideoElement);
    }

    return (
        <Fragment>
            <div className='relative-container'>
                <Grid style={{ margin: '0', height: getMinimizedSpeakersGridHeight(), backgroundColor: 'rgb(30,30,30)'}} centered>         
                    { externalVideoElements }
                </Grid> 
            </div>             
            <style jsx>{`
                .relative-container {
                    position: relative;
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