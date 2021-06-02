import React, {Fragment, useEffect, useMemo, useState} from 'react';
import {fade, makeStyles} from "@material-ui/core/styles";
import SignalWifi0BarRoundedIcon from '@material-ui/icons/SignalWifi0BarRounded';
import SignalWifi1BarRoundedIcon from '@material-ui/icons/SignalWifi1BarRounded';
import SignalWifi2BarRoundedIcon from '@material-ui/icons/SignalWifi2BarRounded';
import SignalWifi3BarRoundedIcon from '@material-ui/icons/SignalWifi3BarRounded';
import SignalWifi4BarRoundedIcon from '@material-ui/icons/SignalWifi4BarRounded';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import CachedIcon from '@material-ui/icons/Cached';
import WarningIcon from '@material-ui/icons/Warning';
import {ArrowUp, ArrowDown} from 'react-feather'
import PropTypes from "prop-types";
import clsx from "clsx";
import { Tooltip, Box, Badge } from "@material-ui/core";
import Draggable from 'react-draggable';
import * as actions from 'store/actions'
import { useDispatch } from 'react-redux';

const gradient = [
    "rgba(0,0,0,0.5)",
    "#54db00",
    "#aeca45",
    "#ca9f00",
    "#df6a00",
    "#e72e00",
    "#e70026",
]

const useStyles = makeStyles(theme => ({
    root: {
        position: "absolute",
        // cursor: "move",
        right: "3%",
        top: "2%",
        zIndex: 9999,
        borderRadius: theme.spacing(2),
        padding: theme.spacing(1),
        boxShadow: theme.shadows[2],
        backgroundColor: fade(theme.palette.common.black, 0.1),
        backdropFilter: "blur(5px)",
        transition: theme.transitions.create("transform", {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
        }),
        "&:hover": {
            transform: `scale(1.2)`,
        }
    },
    subbox: {
        display: "flex"
    }, 
    uplinkWifiIcon: {
        color: ({uplinkIndex}) => gradient[uplinkIndex],
        fontSize: "xx-large",
    },
    svgShadow: {
        filter: `drop-shadow(0px 0px 2px rgba(0,0,0,0.4))`
    },
    downlinkWifiIcon: {
        color: ({downlinkIndex}) => gradient[downlinkIndex],
        fontSize: "xx-large",
    },
    arrowUplinkIcon: {
        color: ({uplinkIndex}) => gradient[uplinkIndex],
        width: theme.spacing(2)
    },
    arrowDownlinkIcon: {
        color: ({downlinkIndex}) => gradient[downlinkIndex],
        width: theme.spacing(2)
    }
}));

const WifiIndicator = ({isDownLink, uplink, agoraRtcConnectionStatus, agoraRtmStatus, downlink, className, ...rest}) => {

    const [defaultPosition, setDefaultPosition] = useState(undefined);
    const dispatch = useDispatch();

    useEffect(() => {
        if (agoraRtcConnectionStatus.curState === "CONNECTING") {
            enqueueSnackbar("Connecting...", "ConnectingStatus", "warning", true)
            return () => dispatch(actions.closeSnackbar('ConnectingStatus'))
        }
        if (agoraRtcConnectionStatus.curState === "CONNECTED") {
            enqueueSnackbar("Connected!", "ConnectedStatus", "success", false)
            return () => dispatch(actions.closeSnackbar('ConnectedStatus'))
        }
        if (agoraRtcConnectionStatus.prevState === "CONNECTED" && agoraRtcConnectionStatus.curState === "DISCONNECTED") {
            enqueueSnackbar("Disconnected. Check your connection...", "DisconnectedStatus", "error", true)
            return () => dispatch(actions.closeSnackbar('DisconnectedStatus'))
        }
    }, [agoraRtcConnectionStatus])

    const enqueueSnackbar = (message, key, variant, persist) => {
        dispatch(actions.enqueueSnackbar({
            message: message,
            options: {
                variant: variant,
                key: key,
                preventDuplicate: true,
                persist: persist
            }
        }))
    }

    useEffect(() => {
        return () => {
            let connectionStati = ["DisconnectedStatus", "ConnectingStatus", "ConnectedStatus"]
            connectionStati.forEach( status => {
                dispatch(actions.closeSnackbar(status))
            })
        }
    }, [])

    useEffect(() => {
        getSavedPosition()
    }, [])

    const classes = useStyles({
        uplinkIndex: uplink,
        downlinkIndex: downlink
    })

    const handleSave = (e, data) => {
        const lastPosition = {x: data.x, y: data.y}
        localStorage.setItem('wifiIconLocation', JSON.stringify(lastPosition));
    }

    const getSavedPosition = () => {
        const lastPosition = localStorage.getItem('wifiIconLocation') || "{}"
        setDefaultPosition(JSON.parse(lastPosition))
    }

    const getNetWorkInfo = (isUplink) => {
        let newClasses = isUplink ? classes.uplinkWifiIcon : classes.downlinkWifiIcon
        newClasses = clsx(newClasses, classes.svgShadow)
        return [
            {
                rating: 0,
                description: `The ${isUplink ? "upload" : "download"} network quality is unknown.`,
                icon: <SignalWifi0BarRoundedIcon className={newClasses}/>,
                color: gradient[0]
            },
            {
                rating: 1,
                description: `The ${isUplink ? "upload" : "download"} network quality is excellent.`,
                icon: <SignalWifi4BarRoundedIcon className={newClasses}/>,
                color: gradient[1]
            },
            {
                rating: 2,
                description: `The ${isUplink ? "upload" : "download"} network quality is good, but the bitrate may be slightly lower than optimal.`,
                icon: <SignalWifi3BarRoundedIcon className={newClasses}/>,
                color: gradient[2]
            },
            {
                rating: 3,
                description: `Users experience slightly impaired communication with this ${isUplink ? "upload" : "download"} quality.`,
                icon: <SignalWifi3BarRoundedIcon className={newClasses}/>,
                color: gradient[3]
            },
            {
                rating: 4,
                description: `Users cannot communicate smoothly with this ${isUplink ? "upload" : "download"} quality.`,
                icon: <SignalWifi2BarRoundedIcon className={newClasses}/>,
                color: gradient[4]
            },
            {
                rating: 5,
                description: `The ${isUplink ? "upload" : "download"} network quality is so poor that users can barely communicate.`,
                icon: <SignalWifi2BarRoundedIcon className={newClasses}/>,
                color: gradient[5]
            },
            {
                rating: 6,
                description: `The ${isUplink ? "upload" : "download"} network quality is down and users cannot communicate at all.`,
                icon: <SignalWifi1BarRoundedIcon className={newClasses}/>,
                color: gradient[6]
            },
        ]
    }

    const uplinkInfo = useMemo(() => getNetWorkInfo(true)[uplink], [uplink])
    const downlinkInfo = useMemo(() => getNetWorkInfo()[downlink], [downlink])

    const ConnectionStatusIcon = ({ status }) => {
        if (status === 'CONNECTED' || status === 'RTM_CONNECTED' ) return  <CheckCircleOutlineIcon style={{ color: '#00F92C' }} />
        if (status === 'CONNECTING' || status === 'RTM_NETWORK_INTERRUPTED' ) return  <WarningIcon style={{ color: '#FFEF00' }} />
        if (status === 'DISCONNECTED' || status === 'RTM_DISCONNECTED' ) return  <ErrorOutlineIcon style={{ color: '#FF3200' }} />
        else return <CachedIcon/>
    }

    return defaultPosition ? (
        <Draggable
            onStop={handleSave}
            defaultPosition={defaultPosition}
            bounds="parent">
                <Box {...rest} className={clsx(classes.root, className)}>
                    <Box>
                        <Tooltip title={"You are connected to the internet"}>
                            <Box marginRight={1} marginBottom={1} alignItems="left" className={classes.subbox}>
                                <Box display="flex" marginRight={1} >
                                    <ConnectionStatusIcon status={agoraRtmStatus.msg}/>
                                </Box>
                                <Box display="flex">
                                    Internet
                                </Box>
                            </Box>
                        </Tooltip>
                        <Tooltip title={"You are connected to and streaming on our server"}>
                            <Box marginRight={1} marginBottom={1} alignItems="left" className={classes.subbox}>
                                <Box display="flex" marginRight={1} >
                                    <ConnectionStatusIcon status={agoraRtcConnectionStatus.curState}/>
                                </Box>
                                <Box display="flex">
                                    Streaming
                                </Box>
                            </Box>
                        </Tooltip>
                    </Box>
                    <Box className={classes.subbox}>
                        <Tooltip style={{color: uplinkInfo.color}} placement="top" title={uplinkInfo.description}>
                            <Box marginRight={1} alignItems="center" display="flex">
                                {uplinkInfo.icon}
                                <ArrowUp className={clsx(classes.arrowUplinkIcon, classes.svgShadow)}/>
                            </Box>
                        </Tooltip>
                        <Tooltip style={{color: downlinkInfo.color}} placement="top" title={downlinkInfo.description}>
                            <Box alignItems="center" display="flex">
                                {downlinkInfo.icon}
                                <ArrowDown className={clsx(classes.arrowDownlinkIcon, classes.svgShadow)}/>
                            </Box>
                        </Tooltip>
                    </Box>              
                </Box>
        </Draggable>
    ) :(<div/>);
};

WifiIndicator.propTypes = {
    downlink: PropTypes.number,
    uplink: PropTypes.number,
    className: PropTypes.string,
};


export default WifiIndicator;
