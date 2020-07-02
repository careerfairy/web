import React, {useEffect, Fragment, useRef, useState} from 'react';
import {Grid} from "semantic-ui-react";
import RemoteVideoContainer from './RemoteVideoContainer';

function StreamerVideoDisplayer(props) {

    const localVideoRef = useRef(null);

    useEffect(() => {
        if (!props.isPlayMode && props.localStream) {
            localVideoRef.current.srcObject = props.localStream;
        }
    },[props.localStream]);

    function getVideoContainerWidth() {
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

    let externalVideoElements = props.streams.map( (stream, index) => {
        return (
            <Grid.Column width={getVideoContainerWidth()} style={{ padding: 0 }} key={stream.streamId}>
                <RemoteVideoContainer stream={stream} length={props.streams.length} height={getVideoContainerHeight()} index={index} />
            </Grid.Column>
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
            <Grid style={{ margin: 0 }}>         
                { externalVideoElements }
            </Grid>          
            <style jsx>{`
                .hidden {
                    display: none;
                }
          `}</style>
        </Fragment>
    );
}

export default StreamerVideoDisplayer;