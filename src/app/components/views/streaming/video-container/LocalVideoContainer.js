import {Tooltip} from '@material-ui/core';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import React, {useEffect, useRef} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import SpeakerInfoOverlay from './SpeakerInfoOverlay';

const useStyles = makeStyles(theme => ({
    companyIcon: {
        maxWidth: "75%",
        margin: "10px"
    },
    videoContainer: {
        position: "relative",
        backgroundColor: "black",
        width: "100%",
        height: "10vh",
        margin: "0 auto",

    },
    mutedOverlay: {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        zIndex: 9901
    },
    audioMuted: {
        position: "absolute",
        bottom: 10,
        right: 10,
        zIndex: 9902
    },
    mutedOverlayContent: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
    },
    videoWrapper: {
        "& video": {
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            maxHeight: "100%",
            maxWidth: "100%",
            // zIndex: 9900,
            backgroundColor: "black"
        }
    },
    localVideoContainer: {
        position: "relative",
        backgroundColor: "black",
        width: "100%",
        margin: "0 auto",
        zIndex: 2000
    },
}))

function LocalVideoContainer(props) {

    const classes = useStyles()

    useEffect(() => {
        debugger;
        console.log(props.localStream);
    },[props.localStream]);

    

    return (
            <div className={classes.localVideoContainer} style={{ height: props.height }}>
                <div id="localVideo" style={{width: '100%', height: '100%'}}/>
                {
                    props.localSpeaker && 
                    <SpeakerInfoOverlay speaker={props.localSpeaker} small={ props.small }/>
                }
                {
                    props.localStream?.videoMuted &&
                    <div className={classes.mutedOverlay}>
                        <div className={classes.mutedOverlayContent}>
                            <div>
                                <img src={props.currentLivestream.companyLogoUrl} className={classes.companyIcon}/>
                            </div>
                            <Tooltip title={'The streamer has turned the camera off'}>
                                <VideocamOffIcon fontSize='large' color='error'/>
                            </Tooltip>
                        </div>
                    </div>
                }
                {
                    props.localStream?.audioMuted &&
                    <div className={classes.audioMuted}>
                        <Tooltip title={'The streamer has muted his microphone'}>
                            <VolumeOffIcon fontSize='large' color='error'/>
                        </Tooltip>
                    </div>
                }
            </div>
    );
}

export default LocalVideoContainer;