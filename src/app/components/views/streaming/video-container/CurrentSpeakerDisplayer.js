import React, {useEffect, Fragment, useRef, useState} from 'react';
import {Grid, Icon} from "semantic-ui-react";
import RemoteVideoContainer from './RemoteVideoContainer';
import {useWindowSize} from '../../../custom-hook/useWindowSize';
import CreateLivestreamProposalStep
    from 'components/views/group/admin/schedule-events/create-livestream-proposal-step/CreateLivestreamProposalStep';
import {makeStyles} from "@material-ui/core/styles";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({

    externalQuarterWidth: {
        height: "100%",
        display: "inline-block",
        width: 250,
        [theme.breakpoints.down("mobile")]: {
            width: 150
        },
    },
    externalSpeakerVideo: {
        position: "absolute",
        left: "0",
        width: "100%",
        zIndex: 101,
        top: "20vh",
        height: "calc(80vh - 160px)",
        [theme.breakpoints.down("mobile")]: {
            top: "15vh",
            height: "45vh",
        },
    },

    externalSpeakerVideoSolo: {
        border: "5px solid blue",
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "calc(100vh - 160px)",
        zIndex: 100
    },
    localQuarterWidth: {
        width: "250px",
        height: "100%",
        display: "inline-block",
        verticalAlign: "top",
        margin: "0"
    },
    localSpeakerVideo: {
        position: "absolute",
        top: "20vh",
        left: "0",
        width: "100%",
        height: "calc(80vh - 160px)"
    },
    localSpeakerVideoSolo: {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "calc(100vh - 160px)"
    },
    localVideoContainer: {
        position: "relative",
        backgroundColor: "black",
        width: "100%",
        margin: "0 auto",
        zIndex: 2000
    },
    relativeContainer: {
        position: "relative",
        height: "100%",
        minHeight: "calc(100vh - 55px)"
    },
    relativeContainerVideos: {
        margin: "0",
        backgroundColor: "rgb(30, 30, 30)",
        overflowX: "scroll",
        overflowY: "hidden",
        whiteSpace: "nowrap",
        textAlign: "center",
        '&::-webkit-scrollbar': {
            height: 5
        },
        '&::-webkit-scrollbar-track': {
            background: theme.palette.common.black
        },
        '&::-webkit-scrollbar-thumb': {
            background: theme.palette.primary.main
        }
    },
}))

function CurrentSpeakerDisplayer(props) {
    const classes = useStyles()

    const windowSize = useWindowSize();

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


    function getVideoContainerClass(streamId, prop) {
        if (props.smallScreenMode) {
            return classes[`${prop}QuarterWidth`]
        }
        if (props.isPlayMode) {
            if (props.streams.length > 1) {
                return streamId === props.currentSpeaker ? classes[`${prop}SpeakerVideo`] : classes[`${prop}QuarterWidth`]
            } else {
                return classes[`${prop}SpeakerVideoSolo`]
            }
        } else {
            if (props.streams.length > 0) {
                return streamId === props.currentSpeaker ? classes[`${prop}SpeakerVideoSolo`] : classes[`${prop}QuarterWidth`]
            } else {
                return classes[`${prop}SpeakerVideoSolo`]
            }
        }
    }

    let externalVideoElements = props.streams.filter(stream => !stream.streamId.includes("screen")).map((stream, index) => {
        return (
            <div key={stream.streamId} className={getVideoContainerClass(stream.streamId, "external")}
                 style={{padding: 0}}>
                <RemoteVideoContainer {...props} isPlayMode={props.isPlayMode} muted={props.muted} stream={stream}
                                      height={getVideoContainerHeight(stream.streamId)} index={index}/>
            </div>
        );
    });

    if (!props.isPlayMode) {
        let localVideoElement =
            <div
                className={getVideoContainerClass(props.localId, "local")}
                style={{padding: '0', margin: '0'}}
                key={"localVideoId"}>
                <div className={classes.localVideoContainer} style={{height: getVideoContainerHeight(props.localId)}}>
                    <div id="localVideo" style={{width: '100%', height: '100%'}}/>
                </div>
            </div>;

        externalVideoElements.unshift(localVideoElement);
    }

    return (
        <div className={classes.relativeContainer}>
            <div className={classes.relativeContainerVideos} style={{height: getMinimizedSpeakersGridHeight()}}>
                {externalVideoElements}
            </div>
        </div>
    );
}

export default CurrentSpeakerDisplayer;