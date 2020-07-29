import React, {Fragment, useRef, useState, useEffect} from 'react';
import {Grid} from "semantic-ui-react";
import RemoteVideoContainer from 'RemoteVideoContainer';
import LivestreamPdfViewer from 'util/LivestreamPdfViewer';

function SmallStreamerVideoDisplayer(props) {

    return (
        <Fragment>
            <div style={{ position: 'absolute', top: '22vh', width: '100%', backgroundColor: 'rgb(30,30,30)'}}>
                <LivestreamPdfViewer livestreamId={props.livestreamId} presenter={props.presenter}/>
            </div>         
            <style jsx>{`
                .hidden {
                    display: none;
                }

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
          `}</style>
        </Fragment>
    )
}

export default SmallStreamerVideoDisplayer;