import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import SignalWifi0BarRoundedIcon from '@material-ui/icons/SignalWifi0BarRounded';
import SignalWifi1BarRoundedIcon from '@material-ui/icons/SignalWifi1BarRounded';
import SignalWifi2BarRoundedIcon from '@material-ui/icons/SignalWifi2BarRounded';
import SignalWifi3BarRoundedIcon from '@material-ui/icons/SignalWifi3BarRounded';
import SignalWifi4BarRoundedIcon from '@material-ui/icons/SignalWifi4BarRounded';
import PropTypes from "prop-types";
import clsx from "clsx";
import Box from "@material-ui/core/Box";

const gradient = [
    "rgba(0,0,0,0.89)",
    "#00ff00",
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
    },
    icon: {
        color: ({colorIndex}) => gradient[colorIndex],
        fontSize: "xxx-large"
    }
}));

const WifiIndicator = ({signalNumber = 1, isUpLink, className, ...rest}) => {

    const classes = useStyles({
        colorIndex: signalNumber
    })

    const icons = [
        <SignalWifi0BarRoundedIcon className={classes.icon}/>,
        <SignalWifi4BarRoundedIcon className={classes.icon}/>,
        <SignalWifi3BarRoundedIcon className={classes.icon}/>,
        <SignalWifi3BarRoundedIcon className={classes.icon}/>,
        <SignalWifi2BarRoundedIcon className={classes.icon}/>,
        <SignalWifi2BarRoundedIcon className={classes.icon}/>,
        <SignalWifi1BarRoundedIcon className={classes.icon}/>,
    ]

    return (
        <Box className={clsx(classes.root, className)}>
            {icons[signalNumber]}
        </Box>
    );
};

WifiIndicator.propTypes = {
    signalNumber: PropTypes.number.integerValue,
    isUpLink: PropTypes.bool,
    className: PropTypes.string,
};


export default WifiIndicator;
