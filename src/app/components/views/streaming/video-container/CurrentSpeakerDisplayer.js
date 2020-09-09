import React, {useEffect, Fragment, useRef, useState} from 'react';
import {Grid} from 'semantic-ui-react';
import RemoteVideoContainer from './RemoteVideoContainer';
import { useWindowSize } from 'components/custom-hook/useWindowSize';

function CurrentSpeakerDisplayer(props) {

    const localVideoRef = useRef(null);
    const windowSize = useWindowSize();

    useEffect(() => {
        if (!props.isPlayMode && props.localStream) {
            localVideoRef.current.srcObject = props.localStream;
        }
    },[props.localStream]);

    function getVideoContainerHeight(streamId) {
        if (props.isPlayMode) {
            if (props.streams.length > 1) {
                if (streamId === props.currentSpeaker && props.mode === 'default') {
                    return windowSize.width > 768 ? 'calc(80vh - 75px)' : '45vh';
                } else {
                    return windowSize.width > 768 ? '20vh' : '15vh';
                }
            } else {
                if (props.mode === 'default') {
                    return windowSize.width > 768 ? 'calc(100vh - 75px)' : '60vh';
                } else {
                    return windowSize.width > 768 ? '20vh' : '15vh';
                }
            }
        } else {
            if (props.streams.length > 0) {
                if (streamId === props.currentSpeaker && props.mode === 'default') {
                    return 'calc(80vh - 75px)';
                } else {
                    return '20vh';
                }
            } else {
                if (props.mode === 'default') {
                    return 'calc(100vh - 75px)';
                } else {
                    return '20vh';
                }
            }
        }
    } 

    function getMinimizedSpeakersGridHeight() {
        if (props.isPlayMode) {
            if (props.streams.length > 1 || props.mode !== 'default') {
                return windowSize.width > 768 ? '20vh' : '15vh';
            } else {
                return '0';
            }
        } else {
            if (props.streams.length > 0 || props.mode !== 'default') {
                return '20vh';
            } else {
                return '0';
            }
        }
    } 

    function getVideoContainerClass(streamId) {
        if (props.isPlayMode) {
            if (props.streams.length > 1) {
                if (props.mode === 'default') {
                    return streamId === props.currentSpeaker ? 'speaker-video' : 'quarter-width';
                } else {
                    return 'quarter-width';
                }
            } else {
                if (props.mode === 'default') {
                    return 'speaker-video-solo';
                } else {
                    return 'quarter-width';
                }
            }
        } else {
            if (props.streams.length > 0) {
                if (props.mode === 'default') {
                    return streamId === props.currentSpeaker ? 'speaker-video' : 'quarter-width';
                } else {
                    return 'quarter-width';
                }
            } else {
                if (props.mode === 'default') {
                    return 'speaker-video-solo';
                } else {
                    return 'quarter-width';
                }
            }
        }
    }

    function updateCurrentStreamId(streamId) {
        if (props.speakerSwitchModeActive) {
            props.setLivestreamCurrentSpeakerId(streamId);
        }
    }

    let externalVideoElements = props.streams.map( (stream, index) => {
        return (
            <div className={getVideoContainerClass(stream.streamId)} style={{ padding: 0 }} key={stream.streamId} onClick={() => updateCurrentStreamId(stream.streamId)}>
                <RemoteVideoContainer isPlayMode={props.isPlayMode} muted={props.muted} stream={stream} height={getVideoContainerHeight(stream.streamId)} index={index}/>
                <style jsx>{`
                    .quarter-width {
                        height: 100%;
                        display: inline-block;
                    }

                    .speaker-video {
                        position: absolute;
                        left: 0;
                        width: 100%;
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

                    @media(max-width: 768px) {
                        .quarter-width {
                            width: 150px;
                        }

                        .speaker-video {
                            top: 15vh;
                            height: 45vh;
                        }
                    }

                    @media(min-width: 768px) {
                        .quarter-width {
                            width: 250px;
                        }

                        .speaker-video {
                            top: 20vh;
                            height: calc(80vh - 160px);
                        }
                    }
                `}</style>
            </div>
        );
    });

    if (!props.isPlayMode) {
        let localVideoElement =
            <div className={getVideoContainerClass(props.localId)} style={{ padding: '0', margin: '0' }} key={"localVideoId"} onClick={() => updateCurrentStreamId(props.localId)}>
                <div className='video-container' style={{ height: getVideoContainerHeight(props.localId) }}>
                    <video id="localVideo" ref={localVideoRef} muted autoPlay width={ '100%' }></video> 
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
                        left: 50%;
                        transform: translate(-50%, -50%);
                        max-width: 100%;
                        max-height: 100%;
                    }
            `}</style>
            </div>;

        externalVideoElements.unshift(localVideoElement);
    }

    return (
        <Fragment>
            <div className='relative-container'>
                <div className='relative-container-videos' style={{ height: getMinimizedSpeakersGridHeight() }}>
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
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 210, 170, 0.8) black;
                }

                .relative-container-videos::-webkit-scrollbar {
                    height: 5px;
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