import React, {useState} from 'react';
import MicOffIcon from '@material-ui/icons/MicOff';
import MicIcon from '@material-ui/icons/Mic';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamIconOff from '@material-ui/icons/VideocamOff';
import {withFirebasePage} from 'context/firebase';
import {makeStyles} from "@material-ui/core/styles";
import {ClickAwayListener, fade} from "@material-ui/core";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";


const useStyles = makeStyles((theme) => ({
    root: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 50,
        width: "100%",
        height: 120,
        padding: 0,
        backgroundColor: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
    },
    speedDial: {
        padding: 0,
        transition: "transform 0.2s",
        transitionTimingFunction: theme.transitions.easeInOut,
        transform: ({open}) => open ? "" : "translate(0, 20px) scale3d(0.8, 0.8, 0.8)",
        "-moz-transform": ({open}) => open ? "" : "translate(0, 20px) scale3d(0.8, 0.8, 0.8)",
        "-o-transform": ({open}) => open ? "" : "translate(0, 20px) scale3d(0.8, 0.8, 0.8)",
        "-webkit-transform": ({open}) => open ? "" : "translate(0, 20px) scale3d(0.8, 0.8, 0.8)",
    },
    actionButton: {
        backgroundColor: "grey",
        color: "white",
        "&:disabled": {
            backgroundColor: fade(theme.palette.primary.main, 0.5),
            color: "white",
        },
        "&:hover": {
            backgroundColor: theme.palette.primary.dark,
        },
    },
    cardHovered: {},
    dialButton: {
        display: "none"
    }

}));

function VideoControlsContainer({currentLivestream: {mode, id, speakerSwitchMode, screenSharerId}, webRTCAdaptor, viewer, joining, firebase, streamerId, isMainStreamer, setDesktopMode}) {
    const DELAY = 3000; //3 seconds
    const [open, setOpen] = useState(true);
    const classes = useStyles({open});
    const [delayHandler, setDelayHandler] = useState(null)
    const [isLocalMicMuted, setIsLocalMicMuted] = useState(false);
    const [isVideoInactive, setIsVideoInactive] = useState(false);

    const handleMouseEnter = event => {
        clearTimeout(delayHandler)
        handleOpen()
    }

    const handleMouseLeave = () => {
        setDelayHandler(setTimeout(() => {
            handleClose()
        }, DELAY))
    }

    const handleOpen = () => {
        setOpen(true);
    };

    const handleToggle = () => {
        setOpen(!open);
    };

    const handleClose = () => {
        setOpen(false);
    };

    function toggleMicrophone() {
        if (isLocalMicMuted) {
            webRTCAdaptor.unmuteLocalMic();
        } else {
            webRTCAdaptor.muteLocalMic();
        }
        setIsLocalMicMuted(!isLocalMicMuted);
    }

    function toggleVideo() {
        if (isVideoInactive) {
            webRTCAdaptor.turnOnLocalCamera();
        } else {
            webRTCAdaptor.turnOffLocalCamera();
        }
        setIsVideoInactive(!isVideoInactive);
    }

    const actions = [
        {
            icon: isLocalMicMuted ? <MicOffIcon fontSize="large"/> : <MicIcon fontSize="large" color="grey"/>,
            onClick: toggleMicrophone,
        },{
            icon: isVideoInactive ? <VideocamIconOff fontSize="large"/> : <VideocamIcon fontSize="large" color="grey"/>,
            onClick: toggleVideo,
        }
    ];

    return (
        <ClickAwayListener onClickAway={handleClose}>
            <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className={classes.root}>
                <SpeedDial
                    ariaLabel="interaction-selector"
                    className={classes.speedDial}
                    FabProps={{onClick: handleToggle, className: classes.dialButton}}
                    icon={<SpeedDialIcon/>}
                    onFocus={handleOpen}
                    open
                >
                    {actions.map((action) => (
                        <SpeedDialAction
                            key={action.name}
                            icon={action.icon}
                            classes={{staticTooltipLabel: classes.tooltip}}
                            FabProps={{
                                size: "large",
                                // classes: {root:  classes.actionButton},
                            }}
                            onClick={action.onClick}
                        />
                    ))}
                </SpeedDial>
            </div>
        </ClickAwayListener>
    )
}

export default withFirebasePage(VideoControlsContainer);