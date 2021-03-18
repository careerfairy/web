import React, {useEffect, useState} from 'react';
import {Box, ClickAwayListener, Fab, CircularProgress} from "@material-ui/core";
import ThumbUpAltOutlinedIcon from "@material-ui/icons/ThumbUpAltOutlined";
import FavoriteBorderOutlinedIcon from "@material-ui/icons/FavoriteBorderOutlined";
import {makeStyles, fade} from "@material-ui/core/styles";
import {amber, deepOrange, grey, red} from "@material-ui/core/colors";
import ClappingSVG from "../../util/CustomSVGs";

const useStyles = makeStyles((theme) => ({
    image: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '28px'
    },
    miniLike: {
        width: "50px !important",
        height: "50px !important",
        backgroundColor: red["A400"],
        color: "white",
        "&:disabled": {
            backgroundColor: fade(red["A400"], 0.5),
            color: "white",
        },
        "&:hover": {
            backgroundColor: red["A700"],
        }
    },
    miniClap: {
        width: "50px !important",
        height: "50px !important",
        backgroundColor: deepOrange[400],
        color: "white",
        "&:disabled": {
            backgroundColor: fade(deepOrange[400], 0.5),
            color: "white",
        },
        "&:hover": {
            backgroundColor: deepOrange[700],
        }
    },
    miniHeart: {
        width: "50px !important",
        height: "50px !important",
        backgroundColor: amber[400],
        color: "white",
        "&:disabled": {
            backgroundColor: fade(amber[400], 0.5),
            color: "white",
        },
        "&:hover": {
            backgroundColor: amber[600],
        }
    },
    miniButtons: {
        "& > *": {
            margin: "0.2rem"
        },
        transition: "transform 0.7s",
        transitionTimingFunction: theme.transitions.easeOut,
        "@media(min-width: 768px)": {
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            transform: "translate(-90px, 0)" // prevent the icons from being overlapped by the chat box when shrunk
        },
        "@media(max-width: 768px)": {
            flexDirection: "column",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }
    },
    cardHovered: {
        "@media(min-width: 768px)": {
            transform: "translate(0, -70px) scale3d(1.7, 1.7, 1.7)",
            "-moz-transform": "translate(0, -70px) scale3d(1.7, 1.7, 1.7)",
            "-o-transform": "translate(0, -70px) scale3d(1.7, 1.7, 1.7)",
            "-webkit-transform": "translate(0, -70px) scale3d(1.7, 1.7, 1.7)",
        },
        "@media(max-width: 768px)": {
            transform: "translate(-50px, 0) scale3d(1.7, 1.7, 1.7)",
            "-moz-transform": "translate(-50px, 0) scale3d(1.7, 1.7, 1.7)",
            "-o-transform": "translate(-50px, 0) scale3d(1.7, 1.7, 1.7)",
            "-webkit-transform": "translate(-50px, 0) scale3d(1.7, 1.7, 1.7)",
        }
    },
    actionArea: {
        display: ({handRaiseActive}) => handRaiseActive ? "none" : "flex",
        "@media(min-width: 768px)": {
            position: "absolute",
            width: "50%",
            bottom: 5,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 150,
            height: 120,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end"
        },
        "@media(max-width: 768px)": {
            position: "absolute",
            right: 15,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 150,
            width: 100,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
        }
    },
    root: {
        position: "relative",
        minHeight: "100vh",
        height: "100%",
        width: "100%",
        touchAction: "manipulation"
    },
    wrapper: {
        position: 'relative',
    },
    fabProgress: {
        color: fade(grey[500], 0.5),
        position: 'absolute',
        zIndex: 1,
        top: 0,
        left: 0,
        height: "50px !important",
        width: "50px !important"
    },

}));

const EmoteButtons =
    ({
         handRaiseActive,
         handleClose,
         handleMouseEnter,
         handleMouseLeave,
         handleLike,
         iconsDisabled,
         handleClap,
         handleHeart,
         open,
         delay,
         smoothness,
         enableIcons
     }) => {
        const classes = useStyles({handRaiseActive});
        const SPEED = isNaN(smoothness) ? 2 : smoothness
        const DELAY = isNaN(delay) ? 3000 : delay
        const INTERVAL = 10 / SPEED
        const TICK_RATE = (DELAY / (INTERVAL * SPEED)) / SPEED

        const [progress, setProgress] = useState(INTERVAL);

        useEffect(() => {
            if (iconsDisabled) {
                setProgress(INTERVAL)
                const timer = setInterval(() => {
                    setProgress((prevProgress) => (prevProgress >= 100 ? INTERVAL : prevProgress + INTERVAL));
                }, TICK_RATE);
                const timeout = setTimeout(() => {
                    enableIcons();
                }, DELAY);
                return () => {
                    clearTimeout(timeout)
                    clearInterval(timer)
                };
            }
        }, [iconsDisabled]);

        return (
            <ClickAwayListener onClickAway={handleClose}>
                <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className={classes.actionArea}>
                    <Box className={classes.miniButtons} classes={{root: open ? classes.cardHovered : ""}}>
                        <div className={classes.wrapper}>
                            <Fab disabled={iconsDisabled} onClick={handleLike} className={classes.miniLike}
                                 aria-label="like">
                                <ThumbUpAltOutlinedIcon fontSize="default"/>
                            </Fab>
                            {iconsDisabled &&
                            <CircularProgress variant="determinate" value={progress} className={classes.fabProgress}/>}
                        </div>
                        <div className={classes.wrapper}>
                            <Fab disabled={iconsDisabled} onClick={handleClap} className={classes.miniClap}
                                 aria-label="clap">
                                <ClappingSVG style={{width: 21, height: 21}} fontSize="default"/>
                            </Fab>
                            {iconsDisabled &&
                            <CircularProgress variant="determinate" value={progress} className={classes.fabProgress}/>}
                        </div>
                        <div className={classes.wrapper}>
                            <Fab disabled={iconsDisabled} onClick={handleHeart} className={classes.miniHeart}
                                 aria-label="heart">
                                <FavoriteBorderOutlinedIcon fontSize="default"/>
                            </Fab>
                            {iconsDisabled &&
                            <CircularProgress variant="determinate" value={progress} className={classes.fabProgress}/>}
                        </div>
                    </Box>
                </div>
            </ClickAwayListener>
        );
    };

export default EmoteButtons;
