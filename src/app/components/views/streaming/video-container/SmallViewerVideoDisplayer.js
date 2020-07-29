import React, {Fragment, useRef, useState, useEffect} from 'react';
import {Grid} from "semantic-ui-react";
import ViewerVideoContainer from 'ViewerVideoContainer';
import LivestreamPdfViewer from 'util/LivestreamPdfViewer';

function SmallViewerVideoDisplayer(props) {

    let externalVideoElements = props.streamers.map( (streamer, index) => {
        return (
            <Grid.Column width='4' style={{ padding: 0, border: '2px solid red' }} key={streamer.id}>
                <ViewerVideoContainer streamer={streamer} length={props.streamers.length} index={index + 1} height={'150px'} isPlaying={props.isPlaying} hasStarted={props.hasStarted}/>
            </Grid.Column>
        );
    });

    return (
        <Fragment>
            <Grid style={{ margin: 0}} centered>         
                { externalVideoElements }
            </Grid> 
            <div style={{ position: 'absolute', top: '150px', width: '100%', backgroundColor: 'rgb(30,30,30)'}}>
                <LivestreamPdfViewer livestreamId={props.livestreamId} presenter={props.presenter}/>
            </div>         
        </Fragment>
    );
}

export default SmallViewerVideoDisplayer;