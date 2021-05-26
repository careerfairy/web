import React, {Fragment, useEffect, useState} from 'react';
import LivestreamPdfViewer from '../../../util/LivestreamPdfViewer';
import {useWindowSize} from '../../../custom-hook/useWindowSize';
import RemoteVideoContainer from './RemoteVideoContainer';
import {BREAKOUT_BANNER_HEIGHT} from "constants/breakoutRooms";
import {TOP_BAR_HEIGHT} from "constants/streamLayout";

function SmallStreamerVideoDisplayer(props) {
    const [topDisplacement, setTopDisplacement] = useState(TOP_BAR_HEIGHT);

    const [showBreakoutAlert, setShowBreakoutAlert] = useState(false);

    useEffect(() => {
        setShowBreakoutAlert(Boolean(props.presenter && props.isBreakout))
        if (props.presenter && props.isBreakout) {
            setTopDisplacement(TOP_BAR_HEIGHT + BREAKOUT_BANNER_HEIGHT)
        } else {
            setTopDisplacement(TOP_BAR_HEIGHT)
        }
    }, [props.presenter, props.isBreakout]);
    return (
        <Fragment>
            <div style={{
                position: 'absolute',
                top: showBreakoutAlert ? `calc(20vh + ${BREAKOUT_BANNER_HEIGHT}px)` : "20vh",
                width: '100%',
                backgroundColor: 'rgb(30,30,30)'
            }}>
                {props.presentation ?
                    <LivestreamPdfViewer topDisplacement={topDisplacement} livestreamId={props.livestreamId}
                                         presenter={props.presenter}
                                         showMenu={props.showMenu}/> :
                    <SharedScreenViewer topDisplacement={topDisplacement}  {...props}/>
                }
            </div>
        </Fragment>
    )
}

const SharedScreenViewer = (props) => {
    const windowSize = useWindowSize();
    const screenShareStream = props.externalMediaStreams?.find(stream => stream.streamId.includes("screen"));

    return (
        <Fragment>
            <div>
                {!props.isLocalScreen && screenShareStream ?
                    <RemoteVideoContainer {...props} isPlayMode={props.isPlayMode} muted={false}
                                          stream={screenShareStream}
                                          height={windowSize.width > 768 ? `calc(80vh - ${props.topDisplacement}px)` : '80vh'}
                                          index={0}/> :
                    <div id={"Screen"} style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: (windowSize.width > 768 || props.isStreamer) ? `calc(80vh - ${props.topDisplacement}px)` : '80vh',
                        backgroundColor: 'rgb(30,30,30)',
                    }}>

                    </div>
                }
            </div>
        </Fragment>
    )
}

export default SmallStreamerVideoDisplayer;