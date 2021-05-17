import React from 'react';
import {useCurrentStream} from "../../../../../context/stream/StreamContext";
import {CountdownCircleTimer} from 'react-countdown-circle-timer'
import {Backdrop, Typography} from "@material-ui/core";
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {colorsArray} from "../../../../util/colors";
import Box from "@material-ui/core/Box";
import useStreamToken from "../../../../custom-hook/useStreamToken";

const useStyles = makeStyles(theme => ({
    backdrop: {
        zIndex: theme.zIndex.tooltip
    },
    time: {
        fontSize: "32px"
    },
    title: {
        color: theme.palette.common.white
    }
}));

const timerProps = {
    isPlaying: true,
    size: 240,
    strokeWidth: 6
};


const minuteSeconds = 10;

const StreamClosedCountdown = () => {
    const classes = useStyles()
    const links = useStreamToken({forStreamType: "mainLivestream"})
    const theme = useTheme()
    const {currentLivestream: {hasStarted, hasEnded}, isBreakout, isStreamer, isMainStreamer} = useCurrentStream()

    const renderTime = (dimension, time) => {
        return (
            <div className="time-wrapper">

                <Typography align="center" variant="h2">{time}</Typography>
                <Typography variant="h6">{dimension}</Typography>
            </div>
        );
    };

    const getTimeSeconds = (time) => (minuteSeconds - time) | 0;

    const handleComplete = () => {
        window.location.href = isMainStreamer ? links.mainStreamerLink : isStreamer ? links.joiningStreamerLink : links.viewerLink
    }

    const startCountDown = Boolean(isBreakout && !hasStarted && hasEnded)

    return startCountDown ? (
        <Backdrop className={classes.backdrop} open>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <Typography className={classes.title} gutterBottom align="center" variant="h4">
                    This room has been closed, you will be re-directed in
                </Typography>
                <CountdownCircleTimer
                    {...timerProps}
                    isPlaying
                    onComplete={handleComplete}
                    duration={10}
                    colors={[
                        [theme.palette.primary.main, 0.33],
                        [colorsArray[1], 0.33],
                        [theme.palette.secondary.main, 0.33],
                    ]}
                >
                    {({elapsedTime}) =>
                        renderTime("seconds", getTimeSeconds(elapsedTime))
                    }
                </CountdownCircleTimer>
            </Box>
        </Backdrop>
    ) : null;
}

export default StreamClosedCountdown;