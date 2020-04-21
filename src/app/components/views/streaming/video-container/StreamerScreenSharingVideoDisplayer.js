import React, {Fragment} from 'react';
import {Grid} from "semantic-ui-react";
import RemoteVideoContainer from './RemoteVideoContainer';

function StreamerScreenSharingVideoDisplayer(props) {

    const screenSharingId = "qidehjjoiwehdoiquweh";

    function getVideoContainerWidth(streamId) {
        if (screenSharingId === streamId) {
            return 16;
        }
        return 4;
    }

    function getVideoContainerHeight(streamId) {
        if (props.streams.length > 0) {
            if (screenSharingId && screenSharingId === streamId) {
                return '50vh';
            }
            return '25vh';
        } else {
            return '100vh';
        }
    }

    let localVideoElement =
        (<Grid.Column width={getVideoContainerWidth(props.mainStreamerId)} style={{ padding: 0 }} key={props.mainStreamerId}>
            <div className='video-container' style={{ height: getVideoContainerHeight(props.mainStreamerId) }}>
                <video id="localVideo" muted autoPlay width={ props.streams.length > 1 || screenSharingId ? '' : '100%' } style={{ right: (props.streams.length > 0) ? '0' : '', bottom: (props.streams.length > 1) ? '0' : '' }}></video> 
            </div>
            <style jsx>{`
               .video-container {
                    position: relative;
                    background-color: black;
                    width: 100%;
                    margin: 0 auto;
                    z-index: -9999;
                    border: 2px solid red;
                }

                #localVideo {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%,-50%);
                    max-height: 100%;
                    max-width: 100%;
                    height: auto;
                    z-index: 9900;
                    background-color: green;
                }
          `}</style>
        </Grid.Column>);

    let videoElements = props.streams.filter(stream => stream.streamId !== screenSharingId).map( (stream, index) => {
        return (
            <Grid.Column width={getVideoContainerWidth(stream.streamId)} style={{ padding: 0 }} key={stream.streamId}>
                <RemoteVideoContainer stream={stream} length={props.streams.length} height={getVideoContainerHeight(stream.streamId)} index={index} />
            </Grid.Column>
        );
    });

    videoElements.unshift(localVideoElement);
    console.log(videoElements);

    let streamingElements = props.streams.filter(stream => stream.streamId === screenSharingId).map( (stream, index) => {
        return (
            <Grid.Column width={getVideoContainerWidth(stream.streamId)} style={{ padding: 0 }} key={stream.streamId}>
                <RemoteVideoContainer stream={stream} length={props.streams.length} height={getVideoContainerHeight(stream.streamId)} index={index} />
            </Grid.Column>
        );
    });

    streamingElements = streamingElements.concat(videoElements);
    console.log(streamingElements);

    return (
        <Fragment>
            <Grid style={{ margin: 0}} centered>         
                { streamingElements }
            </Grid>          
            <style jsx>{`
                .hidden {
                    display: none;
                }
          `}</style>
        </Fragment>
    );
}

export default StreamerScreenSharingVideoDisplayer;