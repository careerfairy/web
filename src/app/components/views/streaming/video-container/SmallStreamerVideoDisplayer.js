import React, {Fragment, useRef, useState, useEffect} from 'react';
import {Grid} from "semantic-ui-react";
import LivestreamPdfViewer from '../../../util/LivestreamPdfViewer';
import { useWindowSize } from '../../../custom-hook/useWindowSize';
import RemoteVideoContainer from './RemoteVideoContainer';

function SmallStreamerVideoDisplayer(props) {
    return (
        <Fragment>
                <div style={{ position: 'absolute', top: '20vh', width: '100%', backgroundColor: 'rgb(30,30,30)'}}>
                    { props.presentation ? 
                        <LivestreamPdfViewer livestreamId={props.livestreamId} presenter={props.presenter} showMenu={props.showMenu}/> : 
                        <SharedScreenViewer {...props}/>
                    }
                </div>         
        </Fragment>
    )
}

const SharedScreenViewer = (props) => {
    const windowSize = useWindowSize();
    const screenShareStream = props.externalMediaStreams.find( stream => stream.streamId.includes("screen"));

    return (
        <Fragment>
                <div>
                    { !props.isLocalScreen && screenShareStream ? 
                        <RemoteVideoContainer {...props} isPlayMode={props.isPlayMode} muted={false} stream={screenShareStream} height={windowSize.width > 768 ? 'calc(80vh - 55px)' : '45vh'} index={0}/> :
                        <div id={"Screen"} style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: windowSize.width > 768 ? 'calc(80vh - 55px)' : '45vh', backgroundColor: 'rgb(30,30,30)'}}/>
                    }
                </div>         
        </Fragment>
    )
}

export default SmallStreamerVideoDisplayer;