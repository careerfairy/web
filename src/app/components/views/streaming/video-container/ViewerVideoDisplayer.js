import React, {useEffect, Fragment, useRef, useState} from 'react';
import {Grid} from "semantic-ui-react";
import ViewerVideoContainer from './ViewerVideoContainer';

function ViewerVideoDisplayer(props) {

    function getVideoContainerWidth() {
        return props.streamers.length > 1 ? 8 : 16;
    }

    function getVideoContainerHeight() {
        return props.streamers.length > 2 ? 'calc(50vh - 37.5px)' : 'calc(100vh - 75px)';
    }

    let videoElements = props.streamers.map( (streamer, index) => {
        return (
            <Fragment>
                <Grid.Column width={ getVideoContainerWidth() } style={{ padding: 0 }} key={streamer.id}>
                    <ViewerVideoContainer streamer={streamer} length={props.streamers.length} index={index + 1} isPlaying={props.isPlaying} height={getVideoContainerHeight()} hasStarted={props.hasStarted}/>
                </Grid.Column>
            </Fragment>
        );
    });

    return (
        <Fragment>
            <Grid style={{ margin: 0}}>         
                { videoElements }
            </Grid>          
            <style jsx>{`
                .hidden {
                    display: none;
                }
          `}</style>
        </Fragment>
    );
}

export default ViewerVideoDisplayer;