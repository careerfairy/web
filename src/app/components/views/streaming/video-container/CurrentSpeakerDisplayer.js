import React, {useEffect, Fragment, useRef, useState} from 'react';
import {Grid, Icon} from "semantic-ui-react";
import RemoteVideoContainer from './RemoteVideoContainer';
import { useWindowSize } from '../../../custom-hook/useWindowSize';
import CreateLivestreamProposalStep from 'components/views/group/admin/schedule-events/create-livestream-proposal-step/CreateLivestreamProposalStep';

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
            if (props.smallScreenMode) {
                return windowSize.width > 768 ? '20vh' : '15vh';
            }
            if (props.streams.length > 1) {
                if (streamId === props.currentSpeaker) {
                    return windowSize.width > 768 ? 'calc(80vh - 55px)' : '45vh';
                } else {
                    return windowSize.width > 768 ? '20vh' : '15vh';
                }
            } else {
                return windowSize.width > 768 ? 'calc(100vh - 55px)' : '60vh';
            }
        } else {
            if (props.smallScreenMode) {
                return '20vh';
            }
            if (props.streams.length > 0) {
                if (streamId === props.currentSpeaker) {
                    return 'calc(80vh - 55px)';
                } else {
                    return '20vh';
                }
            } else {
                return 'calc(100vh - 55px)';
            }
        }
    } 

    function getMinimizedSpeakersGridHeight() {
        if (props.isPlayMode) {
            if (props.streams.length > 1 || props.smallScreenMode) {
                return windowSize.width > 768 ? '20vh' : '15vh';
            } else {
                return '0';
            }
        } else {
            if (props.streams.length > 0 || props.smallScreenMode) {
                return '20vh';
            } else {
                return '0';
            }
        }
    } 

    

    function getVideoContainerClass(streamId) {
        if (props.smallScreenMode) {
            return 'quarter-width';
        }
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
            <div key={stream.streamId} className={getVideoContainerClass(stream.streamId)} style={{ padding: 0 }}>
                <RemoteVideoContainer {...props} isPlayMode={props.isPlayMode} muted={props.muted} stream={stream} height={getVideoContainerHeight(stream.streamId)} index={index}/>
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
            <div className={getVideoContainerClass(props.localId)} style={{ padding: '0', margin: '0' }} key={"localVideoId"}>
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
                    min-height: calc(100vh - 55px);
                }

                .relative-container-videos {
                    margin: 0;
                    background-color: rgb(30,30,30);
                    overflow-x: scroll;
                    overflow-y: hidden;
                    white-space: nowrap;
                    text-align: center;
                    scrollbar-width: 5px;
                    scollbar-color: black rgba(0, 210, 170, 0.8);
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