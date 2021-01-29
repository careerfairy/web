import React from 'react';
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
        left: "5%",
        bottom: "6%",
        zIndex: 9999,
        display: "flex",
        borderRadius: theme.spacing(2),
        padding: theme.spacing(1),
        boxShadow: theme.shadows[10],
        backgroundColor: fade(theme.palette.common.black, 0.1),
        backdropFilter: "blur(5px)"
    },
    uplinkWifiIcon: {
        color: ({uplinkIndex}) => gradient[uplinkIndex],
        fontSize: "xx-large",
    },
    svgShadow:{
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

    const classes = useStyles({
        uplinkIndex: uplink,
        downlinkIndex: downlink
    })

    const icons = (isUplink) => {
        const newClasses = isUplink ? classes.uplinkWifiIcon : classes.downlinkWifiIcon
        return [
            <SignalWifi0BarRoundedIcon className={newClasses} classes={{root:classes.svgShadow}}/>,
            <SignalWifi4BarRoundedIcon className={newClasses} classes={{root:classes.svgShadow}}/>,
            <SignalWifi3BarRoundedIcon className={newClasses} classes={{root:classes.svgShadow}}/>,
            <SignalWifi3BarRoundedIcon className={newClasses} classes={{root:classes.svgShadow}}/>,
            <SignalWifi2BarRoundedIcon className={newClasses} classes={{root:classes.svgShadow}}/>,
            <SignalWifi2BarRoundedIcon className={newClasses} classes={{root:classes.svgShadow}}/>,
            <SignalWifi1BarRoundedIcon className={newClasses} classes={{root:classes.svgShadow}}/>,
        ]
    }

    return (
        <Box {...rest} className={clsx(classes.root, className)}>
            <Box marginRight={1} alignItems="center" display="flex">
                {icons(true)[uplink]}
                <ArrowUp  className={clsx(classes.arrowUplinkIcon, classes.svgShadow)}/>
            </Box>
            <Box alignItems="center" display="flex">
                {icons()[downlink]}
                <ArrowDown className={clsx(classes.arrowDownlinkIcon, classes.svgShadow)}/>
            </Box>
        </Box>
    );
};

WifiIndicator.propTypes = {
    downlink: PropTypes.number,
    uplink: PropTypes.number,
    className: PropTypes.string,
};


export default WifiIndicator;
