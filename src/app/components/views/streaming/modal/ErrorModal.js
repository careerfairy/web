import { Button, CircularProgress, Dialog, DialogContent, Typography } from '@material-ui/core';
import {makeStyles} from "@material-ui/core/styles";
import { ErrorOutline } from '@material-ui/icons';
import React, {useState, useEffect, useRef} from 'react';

const useStyles = makeStyles((theme) => ({
    container: {
        position: "relative",
        minHeight: "20vh",
        minWidth: 300
    },
    content: {
        position: "absolute",
        top: "50%",
        left: "50%",
        width: "100%",
        margin: 0,
        transform: "translate(-50%, -50%)",
        textAlign: "center",
    },
    text: {
        marginTop: 10
    },
    icon: {
        color: 'red',
        marginBottom: 10
    }
}));

const DEFAULT_ERROR_MESSAGE = "An Error occured while joining the stream. Please contact support.";

const errorMessages = {
    "UNEXPECTED_ERROR": "An unexpected error occured. Please contact support for more information.",
    "UNEXPECTED_RESPONSE": "An unexpected error occured on the server. Please contact support for more information.",
    "INVALID_PARAMS": "",
    "NOT_SUPPORTED": "Your browser does not support certain connection operations. Please use Google Chrome v74+ for macOS/Windows and try again.",
    "INVALID_OPERATION": "Some invalid operation was performed. Please contact support.",
    "OPERATION_ABORTED": "The operation failed due to poor network conditions. Please check your connection.",
    "WEB_SECURITY_RESTRICT": "Some browser security restrictions are not met. Please contact support.",
    "NETWORK_TIMEOUT": "The operation failed due to poor network conditions. Please check your connection.",
    "NETWORK_RESPONSE_ERROR": "An unexpected error occured on the server. Please contact support for more information.",
    "NETWORK_ERROR": "An unexpected error occured. Please contact support for more information.",
    "WS_ABORT": "An unexpected error occured. Please contact support for more information.",
    "WS_DISCONNECT": "An unexpected error occured. Please contact support for more information.",
    "WS_ERR": "Your browser does not support certain connection operations. Please use Google Chrome v74+ for macOS/Windows and try again.",
    "ENUMERATE_DEVICES_FAILED": "Failed to discover your camera and/or microphone",
    "DEVICE_NOT_FOUND": "The specific media device you selected is not available.",
    "TRACK_IS_DISABLED": "",
    "SHARE_AUDIO_NOT_ALLOWED": "",
    "CHROME_PLUGIN_NO_RESPONSE": "",
    "CHROME_PLUGIN_NOT_INSTALL": "",
    "MEDIA_OPTION_INVALID": "",
    "CONSTRAINT_NOT_SATISFIED": "",
    "PERMISSION_DENIED": "",
    "FETCH_AUDIO_FILE_FAILED": "",
    "READ_LOCAL_AUDIO_FILE_ERROR": "",
    "DECODE_AUDIO_FILE_FAILED": "",
    "UID_CONFLICT": "",
    "INVALID_UINT_UID_FROM_STRING_UID": "",
    "CAN_NOT_GET_PROXY_SERVER": "",
    "CAN_NOT_GET_GATEWAY_SERVER": "",
    "INVALID_LOCAL_TRACK": "",
    "CAN_NOT_PUBLISH_MULTIPLE_VIDEO_TRACKS": "",
    "INVALID_REMOTE_USER": "",
    "REMOTE_USER_IS_NOT_PUBLISHED": "",
    "LIVE_STREAMING_TASK_CONFLICT": "",
    "LIVE_STREAMING_INVALID_ARGUMENT": "",
    "LIVE_STREAMING_INTERNAL_SERVER_ERROR": "",
    "LIVE_STREAMING_PUBLISH_STREAM_NOT_AUTHORIZED": "",
    "LIVE_STREAMING_CDN_ERROR": "",
    "LIVE_STREAMING_INVALID_RAW_STREAM": "",
    "CROSS_CHANNEL_WAIT_STATUS_ERROR": "",
    "CROSS_CHANNEL_FAILED_JOIN_SRC": "",
    "CROSS_CHANNEL_FAILED_JOIN_DEST": "",
    "CROSS_CHANNEL_FAILED_PACKET_SENT_TO_DESTINVALID_PARAMS": "",
    "INVALID_PARAMS": "",
    "INVALID_PARAMS": "",



    "RTC_JOIN_ERR_REPEAT_JOIN": DEFAULT_ERROR_MESSAGE,
    "RTC_JOIN_SOCKET_ERROR": DEFAULT_ERROR_MESSAGE,
    "RTC_JOIN_CANNOT_MEET_AREA_DEMAND": DEFAULT_ERROR_MESSAGE,
    "RTC_MEDIA_PERMISSION_DENIED": "Your browser is missing permissions to access your camera and/or microphone. Check these permissions and try again.",
    "RTC_MEDIA_OPTION_INVALID": DEFAULT_ERROR_MESSAGE,
    "RTC_DEVICES_NOT_FOUND": "Your browser could not detect any media devices. Are your camera and microphone connected?",
    "RTC_NOT_SUPPORTED": "This browser is not supported by CareerFairy. Try using an up-to-date version of Google Chrome or Microsoft Edge",
    "RTC_CONSTRAINT_NOT_SATISFIED": "This camera and/or microphone are not supported by CareerFairy",
    "RTC_UNDEFINED_ERROR": DEFAULT_ERROR_MESSAGE,
    "RTC_STREAM_ALREADY_PUBLISHED": "Someone already connected through this link.",
    "RTC_INVALID_LOCAL_STREAM": DEFAULT_ERROR_MESSAGE,
    "RTC_INVALID_OPERATION": DEFAULT_ERROR_MESSAGE,
    "RTC_PUBLISH_STREAM_FAILED": "It seems like you could not connect to CareerFairy. Check your VPN and firewall settings.",
    "RTC_PEERCONNECTION_FAILED": "It seems like you could not connect to CareerFairy. Check your VPN and firewall settings.",
    "RTC_REQUEST_ABORT": DEFAULT_ERROR_MESSAGE,
    "RTC_SCREEN_SHARE_NOT_ALLOWED": "Your browser does not have permission to share your screen. Please check your computer's privacy settings.",
}

const ConnectionError = ({ agoraRtcStatus, setState, classes }) => {
    return(
        <>
            <ErrorOutline fontSize="large" className={classes.icon}/>
            <Typography>{ agoraRtcStatus.error.message }</Typography>
            {
                agoraRtcStatus.msg === "RTC_SCREEN_SHARE_NOT_ALLOWED" &&
                <div>
                    <Button onClick={() => setState("closed")}>Close</Button>
                </div>
            }
        </>
    )
}

const NetworkError = () => {
    return(
        <>
            <CircularProgress/>
            <Typography>Network error. Attempting to reconnect...</Typography>
        </>
    )
}

function ErrorModal({ agoraRtcStatus, agoraRtmStatus }) {

    const [state, setState] = useState("open");
    const classes = useStyles();

    useEffect(() => {
        setState("open");
        console.log("STATUS", agoraRtcStatus)
    },[agoraRtcStatus])

    return (
        <Dialog open={((agoraRtcStatus && agoraRtcStatus.type === "ERROR") || (agoraRtmStatus && agoraRtmStatus.type === "ERROR"))  && state === "open"}>
            <DialogContent> 
                <div className={classes.container}>
                    <div className={classes.content}>
                        {
                            (agoraRtcStatus && agoraRtcStatus.type === "ERROR") &&
                            <ConnectionError agoraRtcStatus={agoraRtcStatus} setState={setState} classes={classes}/>
                        }
                        {
                            (agoraRtmStatus && agoraRtmStatus.type === "ERROR") &&
                            <NetworkError/>
                        }
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default ErrorModal;