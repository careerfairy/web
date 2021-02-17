import { CircularProgress, Dialog, DialogContent, makeStyles } from '@material-ui/core';
import React, {useState, useEffect, useRef} from 'react';

const useStyles = makeStyles((theme) => ({
    container: {
        position: "relative",
        height: "20vh",
        width: 300
    },
    content: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
    },
    text: {
        marginTop: 10
    }
}));

function LoadingModal({ agoraRtcStatus }) {

    const classes = useStyles();

    const LOADING_AGORA_STATI = [
        "RTC_INITIAL",
        "RTC_INITIALIZING",
        "RTC_JOINING_CHANNEL",
        "RTC_JOINED_CHANNEL",
        "RTC_REQUEST_MEDIA_ACCESS",
        "RTC_PUBLISH_STREAM",
        "RTM_DISCONNECTED",
        "RTM_RECONNECTING"
    ]

    return (
        <Dialog open={agoraRtcStatus && agoraRtcStatus.type === "INFO" && LOADING_AGORA_STATI.includes(agoraRtcStatus.msg)}>
            <DialogContent> 
                <div className={classes.container}>
                    <div className={classes.content}>
                        <CircularProgress />
                        <div className={classes.text}>
                            { 'Connecting...' }
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default LoadingModal;