import React, {useEffect, useState} from 'react';
import {Box, ClickAwayListener, Fab, fade} from "@material-ui/core";
import ThumbUpAltOutlinedIcon from "@material-ui/icons/ThumbUpAltOutlined";
import CircularProgress from "@material-ui/core/CircularProgress";
import FavoriteBorderOutlinedIcon from "@material-ui/icons/FavoriteBorderOutlined";
import {makeStyles} from "@material-ui/core/styles";
import {amber, deepOrange, green, grey, red} from "@material-ui/core/colors";

const useStyles = makeStyles((theme) => ({
    image: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '28px'
    },
    miniLike: {
        width: "36px !important",
        height: "36px !important",
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
        width: "36px !important",
        height: "36px !important",
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
        width: "36px !important",
        height: "36px !important",
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
        transition: "transform 0.3s",
        transitionTimingFunction: theme.transitions.easeInOut,
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
            transform: "translate(0, -70px) scale3d(2.4, 2.4, 2.4)",
            "-moz-transform": "translate(0, -70px) scale3d(2.4, 2.4, 2.4)",
            "-o-transform": "translate(0, -70px) scale3d(2.4, 2.4, 2.4)",
            "-webkit-transform": "translate(0, -70px) scale3d(2.4, 2.4, 2.4)",
        },
        "@media(max-width: 768px)": {
            transform: "translate(-50px, 0) scale3d(2.4, 2.4, 2.4)",
            "-moz-transform": "translate(-50px, 0) scale3d(2.4, 2.4, 2.4)",
            "-o-transform": "translate(-50px, 0) scale3d(2.4, 2.4, 2.4)",
            "-webkit-transform": "translate(-50px, 0) scale3d(2.4, 2.4, 2.4)",
        }
    },
    actionArea: {
        display: ({handRaiseActive}) => handRaiseActive ? "none" : "flex",
        "@media(min-width: 768px)": {
            position: "absolute",
            width: "100%",
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
        height: "36px !important",
        width: "36px !important"
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
         setIconsDisabled
     }) => {
        const classes = useStyles({handRaiseActive});
        const SPEED = isNaN(smoothness) ? 2 : smoothness
        const DELAY = isNaN(delay) ? 3000 : delay
        const INTERVAL = 10 / SPEED
        const TICK_RATE = (DELAY / (INTERVAL * SPEED)) / SPEED

        const [progress, setProgress] = useState(INTERVAL);

        useEffect(() => {
            if (iconsDisabled) {
                const timer = setInterval(() => {
                    setProgress((prevProgress) => (prevProgress >= 100 ? INTERVAL : prevProgress + INTERVAL));
                }, TICK_RATE);
                const timeout = setTimeout(() => {
                    setIconsDisabled(false);
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
                            <Fab onClick={handleLike} disabled={iconsDisabled} className={classes.miniLike}
                                 aria-label="like">
                                <ThumbUpAltOutlinedIcon fontSize="inherit"/>
                            </Fab>
                            {iconsDisabled &&
                            <CircularProgress variant="static" value={progress} className={classes.fabProgress}/>}
                        </div>
                        <div className={classes.wrapper}>
                            <Fab onClick={handleClap} disabled={iconsDisabled} className={classes.miniClap}
                                 aria-label="clap">
                                <img alt="clap button" style={{width: 15}} src='/clapping.png'
                                     className={classes.image}/>
                            </Fab>
                            {iconsDisabled &&
                            <CircularProgress variant="static" value={progress} className={classes.fabProgress}/>}
                        </div>
                        <div className={classes.wrapper}>
                            <Fab onClick={handleHeart} disabled={iconsDisabled} className={classes.miniHeart}
                                 aria-label="heart">
                                <FavoriteBorderOutlinedIcon fontSize="inherit"/>
                            </Fab>
                            {iconsDisabled &&
                            <CircularProgress variant="static" value={progress} className={classes.fabProgress}/>}
                        </div>
                    </Box>
                </div>
            </ClickAwayListener>
        );
    };

export default EmoteButtons;
