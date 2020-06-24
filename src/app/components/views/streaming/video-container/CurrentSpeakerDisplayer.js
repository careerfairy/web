import React, {useEffect, Fragment, useRef, useState} from 'react';
import {Grid} from "semantic-ui-react";
import RemoteVideoContainer from './RemoteVideoContainer';

function CurrentSpeakerDisplayer(props) {

    const localVideoRef = useRef(null);

    useEffect(() => {
        if (!props.isPlayMode && props.localStream) {
            localVideoRef.current.srcObject = props.localStream;
        }
    },[props.localStream]);

    function getVideoContainerHeight(streamId) {
        if (props.streams.length > 0) {
            if (streamId === props.currentSpeaker) {
                return 'calc(80vh - 75px)';
            } else {
                return '20vh';
            }
        } else {
            return 'calc(100vh - 75px)';
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
                return streamId === props.currentSpeaker ? 'speaker-video' : 'quarter-width';
            } else {
                return 'speaker-video-solo';
            }
        } else {
            if (props.streams.length > 0) {
                return streamId === props.currentSpeaker ? 'speaker-video' : 'quarter-width';
            } else {
                return 'speaker-video-solo';
            }
        }
    }

    let externalVideoElements = props.streams.map( (stream, index) => {
        return (
            <div className={getVideoContainerClass(stream.streamId)} style={{ padding: 0 }} key={stream.streamId}>
                <RemoteVideoContainer isPlayMode={props.isPlayMode} stream={stream} height={getVideoContainerHeight(stream.streamId)} index={index}/>
                <style jsx>{`
                    .quarter-width {
                        width: 250px;
                        height: 100%;
                        display: inline-block;
                    }

                    .speaker-video {
                        position: absolute;
                        top: 20vh;
                        left: 0;
                        width: 100%;
                        height: calc(80vh - 160px);
                        z-index: 101;
                    }

                    .speaker-video-solo {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: calc(100vh - 160px);
                        z-index: 100;
                    }     
                `}</style>
            </div>
        );
    });

    if (!props.isPlayMode) {
        let localVideoElement =
            <div className={getVideoContainerClass(props.localId)} style={{ padding: '0', margin: '0' }} key={"localVideoId"}>
                <div className='video-container' style={{ height: getVideoContainerHeight(props.localId) }}>
                    <video id="localVideo" ref={localVideoRef} muted autoPlay width={ '100%' } style={{ right: (props.streams.length > 0) ? '0' : '', bottom: (props.streams.length > 1) ? '0' : '' }}></video> 
                </div>
                <style jsx>{`
                    .quarter-width {
                        width: 250px;
                        height: 100%;
                        display: inline-block;
                    }

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
                        left: 0;
                        transform: translateY(-50%);
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
            `}</style>
            </div>;

        externalVideoElements.unshift(localVideoElement);
    }

    return (
        <Fragment>
            <div className='relative-container'>
                <div className='relative-container-videos' style={{ height: getMinimizedSpeakersGridHeight() }} centered>
                    { externalVideoElements }
                </div> 
            </div>             
            <style jsx>{`
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

                .relative-container-videos::-webkit-scrollbar {
                    height: 3px;
                }

                .relative-container-videos::-webkit-scrollbar-track {
                    background: black;
                }

                .relative-container-videos::-webkit-scrollbar-thumb {
                    background: rgba(0, 210, 170, 0.8);
                }
                
                .hidden {
                    display: none;
                }
          `}</style>
        </Fragment>
    );
}

export default CurrentSpeakerDisplayer;