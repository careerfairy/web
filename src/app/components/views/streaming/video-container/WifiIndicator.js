import React, {useEffect, useMemo, useState} from 'react';
import {fade, makeStyles} from "@material-ui/core/styles";
import SignalWifi0BarRoundedIcon from '@material-ui/icons/SignalWifi0BarRounded';
import SignalWifi1BarRoundedIcon from '@material-ui/icons/SignalWifi1BarRounded';
import SignalWifi2BarRoundedIcon from '@material-ui/icons/SignalWifi2BarRounded';
import SignalWifi3BarRoundedIcon from '@material-ui/icons/SignalWifi3BarRounded';
import SignalWifi4BarRoundedIcon from '@material-ui/icons/SignalWifi4BarRounded';
import {ArrowUp, ArrowDown} from 'react-feather'
import PropTypes from "prop-types";
import clsx from "clsx";
import Box from "@material-ui/core/Box";
import {Tooltip} from "@material-ui/core";
import Draggable from 'react-draggable';

const gradient = [
    "rgba(0,0,0,0.89)",
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
        cursor: "move",
        left: "10%",
        bottom: "7%",
        zIndex: 9999,
        display: "flex",
        borderRadius: theme.spacing(2),
        padding: theme.spacing(1),
        boxShadow: theme.shadows[10],
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
    uplinkWifiIcon: {
        color: ({uplinkIndex}) => gradient[uplinkIndex],
        fontSize: "xx-large",
    },
    svgShadow: {
        filter: "drop-shadow(0px 3px 3px rgba(0, 0, 0, 0.4))"
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

const WifiIndicator = ({isDownLink, uplink, downlink, className, ...rest}) => {

    const [defaultPosition, setDefaultPosition] = useState(undefined);


    useEffect(() => {
        getSavedPosition()
    },[])

    const classes = useStyles({
        uplinkIndex: uplink,
        downlinkIndex: downlink
    })

    const handleSave = (e, data) => {
        const lastPosition = {x: data.x, y: data.y}
        localStorage.setItem('wifiIconLocation', JSON.stringify(lastPosition));
    }

    const getSavedPosition = () => {
        const lastPosition = localStorage.getItem('wifiIconLocation') || ''
        if(lastPosition){
            setDefaultPosition(JSON.parse(lastPosition))
        }
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

    return (
        <Draggable
            onStop={handleSave}
            defaultPosition={defaultPosition}
            bounds="parent">
            <Box {...rest} className={clsx(classes.root, className)}>
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
        </Draggable>
    );
};

WifiIndicator.propTypes = {
    downlink: PropTypes.number,
    uplink: PropTypes.number,
    className: PropTypes.string,
};


export default WifiIndicator;
