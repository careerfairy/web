import React, {Fragment, useRef, useState, useEffect} from 'react';
import {Grid} from "semantic-ui-react";
import RemoteVideoContainer from './RemoteVideoContainer';
import LivestreamPdfViewer from '../../../util/LivestreamPdfViewer';

function SmallStreamerVideoDisplayer(props) {

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

    let externalVideoElements = props.streams.map( (stream, index) => {
        return (
            <Grid.Column width='4' style={{ padding: 0 }} key={stream.streamId}>
                <RemoteVideoContainer stream={stream} length={props.streams.length} height={'150px'} index={index} />
            </Grid.Column>
        );
    });

    if (!props.isPlayMode) {
        let localVideoElement =
        <Grid.Column width='4' style={{ padding: 0 }} key={"localVideoId"}>
            <div className='video-container' style={{ height: '150px' }}>
                <video id="localVideo" ref={localVideoRef} muted autoPlay width={ props.streams.length > 1 ? '' : '100%' }></video> 
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
            <Grid style={{ margin: 0}} centered>         
                { externalVideoElements }
            </Grid> 
            <div style={{ position: 'absolute', top: '150px', width: '100%', backgroundColor: 'rgb(30,30,30)'}}>
                <LivestreamPdfViewer livestreamId={props.livestreamId} presenter={props.presenter}/>
            </div>         
            <style jsx>{`
                .hidden {
                    display: none;
                }
          `}</style>
        </Fragment>
    );
}

export default SmallStreamerVideoDisplayer;