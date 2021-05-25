import React from 'react';
import RemoteVideoContainer from './RemoteVideoContainer';
import {useWindowSize} from '../../../custom-hook/useWindowSize';
import {makeStyles} from "@material-ui/core/styles";
import SpeakerInfoOverlay from './SpeakerInfoOverlay';
import LocalVideoContainer from './LocalVideoContainer';
import Typography from "@material-ui/core/Typography";
import {Box, CircularProgress} from "@material-ui/core";


const useStyles = makeStyles(theme => ({

    externalQuarterWidth: {
        height: "100%",
        display: "inline-block",
        width: 250,
        [theme.breakpoints.down("sm")]: {
            width: 190
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
        margin: "0",
        [theme.breakpoints.down("sm")]: {
            minWidth: 190,
        },
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
        zIndex: 2000,
        "& video": {
            // objectFit: "contain !important",
        }
    },
    relativeContainer: {
        position: "relative",
        height: "100%",
        minHeight: "calc(100vh - 55px)",
    },
    noStreamOverlayWrapper: {
        position: "relative",
        height: "100%",
        minHeight: "calc(100vh - 55px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",

    },
    relativeContainerVideos: {
        margin: "0",
        backgroundColor: "rgb(30, 30, 30)",
        overflowX: "scroll",
        overflowY: "hidden",
        whiteSpace: "nowrap",
        textAlign: "center",
        '& > div': {
            margin: theme.spacing(0.2),
        },
        // '& > *:nth-last-child(n+2)': {
        //     margin: theme.spacing(0, 0.2)
        // },
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

// console.count("-> CurrentSpeakerDisplayer");
    function getVideoContainerHeight(streamId) {
        if (props.isPlayMode) {
            if (props.smallScreenMode) {
                return "20vh"
                // return windowSize.width > 768 ? '20vh' : '15vh';
            }
            if (props.streams.length > 1) {
                if (streamId === props.currentSpeaker) {
                    return windowSize.width > 768 ? 'calc(80vh - 55px)' : '80vh';
                    // return windowSize.width > 768 ? 'calc(80vh - 55px)' : '45vh';
                } else {
                    return "20vh";
                    // return windowSize.width > 768 ? '20vh' : '15vh';
                }
            } else {
                return windowSize.width > 768 ? 'calc(100vh - 55px)' : props.isViewer ? '100vh' : '60vh';
            }
        } else {
            if (props.smallScreenMode) {
                return '20vh';
            }
            if (props.streams.length > 0) {
                if (streamId === props.currentSpeaker) {
                    return (windowSize.width > 768 || !props.isViewer) ? 'calc(80vh - 55px)' : '80vh';
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
                return "20vh";
                // return windowSize.width > 768 ? '20vh' : '15vh';
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
            return `${prop}QuarterWidth`
        }
        if (props.isPlayMode) {
            if (props.streams.length > 1) {
                return streamId === props.currentSpeaker ? `${prop}SpeakerVideo` : `${prop}QuarterWidth`
            } else {
                return `${prop}SpeakerVideoSolo`
            }
        } else {
            if (props.streams.length > 0) {
                return streamId === props.currentSpeaker ? `${prop}SpeakerVideo` : `${prop}QuarterWidth`
            } else {
                return `${prop}SpeakerVideoSolo`
            }
        }
    }

    let externalVideoElements = []

    if (props.streams.length > 4) {
        let currentSpeakerStream = props.streams.find( stream => stream.streamId === props.currentSpeaker )
        let rearrangedVideoStreams = props.streams.filter( stream => stream.streamId !== props.currentSpeaker )

        if (currentSpeakerStream) {
            rearrangedVideoStreams.unshift(currentSpeakerStream);
        }
        externalVideoElements = rearrangedVideoStreams.filter(stream => !stream.streamId.includes("screen")).map((stream, index) => {
            const videoClass = getVideoContainerClass(stream.streamId, "external");
            return (
                <div key={stream.streamId} className={classes[videoClass]}
                     style={{padding: 0}}>
                    <RemoteVideoContainer {...props} isPlayMode={props.isPlayMode} muted={props.muted} stream={stream}
                                          height={getVideoContainerHeight(stream.streamId)}
                                          small={videoClass.includes("QuarterWidth")} index={index}/>
                </div>
            );
        });
    } else {
        externalVideoElements = props.streams.filter(stream => !stream.streamId.includes("screen")).map((stream, index) => {
            const videoClass = getVideoContainerClass(stream.streamId, "external");
            return (
                <div key={stream.streamId} className={classes[videoClass]}
                     style={{padding: 0}}>
                    <RemoteVideoContainer {...props} isPlayMode={props.isPlayMode} muted={props.muted} stream={stream}
                                          height={getVideoContainerHeight(stream.streamId)}
                                          small={videoClass.includes("QuarterWidth")} index={index}/>
                </div>
            );
        });
    }

    if (!props.isPlayMode) {
        const localVideoClass = getVideoContainerClass(props.localId, "local");
        const localSpeaker = props.currentLivestream.liveSpeakers?.find(speaker => speaker.speakerUuid === props.localId);
        let localVideoElement =
            <div key={"localVideo"} className={classes[localVideoClass]}>
                <LocalVideoContainer localId={props.localId} localSpeaker={localSpeaker}
                                     height={getVideoContainerHeight(props.localId)}
                                     small={localVideoClass.includes("QuarterWidth")} {...props}/>
            </div>

        externalVideoElements.unshift(localVideoElement);
    }

    if (!externalVideoElements.length) {
        return (
            <div className={classes.noStreamOverlayWrapper}>
                {props.joinedChannel ? (
                    <Typography variant="h5" style={{color: "white", margin: "auto"}}>
                        Waiting for streamer
                    </Typography>
                ) : (
                    <CircularProgress style={{margin: "auto"}}/>
                )}
            </div>)
    }

    //TO BE TESTED

    return (
        <div className={classes.relativeContainer}>
            <div className={classes.relativeContainerVideos} style={{height: getMinimizedSpeakersGridHeight()}}>
                {externalVideoElements}
            </div>
        </div>
    );
}

export default CurrentSpeakerDisplayer;