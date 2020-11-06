
import React, {useState, useContext, Fragment, useEffect} from 'react';
import {Grid, Icon, Button} from "semantic-ui-react";
import MicOffIcon from '@material-ui/icons/MicOff';
import MicIcon from '@material-ui/icons/Mic';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamIconOff from '@material-ui/icons/VideocamOff';
import {withFirebasePage} from 'context/firebase';
import {makeStyles} from "@material-ui/core/styles";
import {Accordion, ClickAwayListener, fade} from "@material-ui/core";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import TutorialContext from "../../../../context/tutorials/TutorialContext";
import {TooltipButtonComponent, TooltipText, TooltipTitle, WhiteTooltip} from "../../../../materialUI/GlobalTooltips";
import useTheme from "@material-ui/core/styles/useTheme";


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
    tooltip: {
        transition: "all 0.8s",
        transitionTimingFunction: theme.transitions.easeInOut,
        display: ({open}) => open ? "block" : "none",
        whiteSpace: "nowrap"
    },
    dialButton: {
        display: "none"
    }

}));

function VideoControlsContainer({currentLivestream: {mode, id, speakerSwitchMode, test, screenSharerId}, webRTCAdaptor, viewer, joining, firebase, streamerId, isMainStreamer, setDesktopMode}) {
    const {tutorialSteps, setTutorialSteps} = useContext(TutorialContext);
    const theme = useTheme()
    const DELAY = 3000; //3 seconds
    const [open, setOpen] = useState(true);
    const classes = useStyles({open});
    const [delayHandler, setDelayHandler] = useState(null)
    const [isLocalMicMuted, setIsLocalMicMuted] = useState(false);
    const [isVideoInactive, setIsVideoInactive] = useState(false);

    const presentMode = mode === "presentation"
    const automaticMode = speakerSwitchMode === "automatic"
    const desktopMode = mode === "desktop"

    useEffect(() => {
        if (isOpen(13)) {
            setOpen(true)
        }
    }, [tutorialSteps])

    const isOpen = (property) => {
        return Boolean(test
            && tutorialSteps.streamerReady
            && tutorialSteps[property]
        )
    }

    const handleConfirm = (property) => {
        setTutorialSteps({
            ...tutorialSteps,
            [property]: false,
            [property + 1]: true,
        })
    }


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

    const showShareDesktopButton = () => {
        if (desktopMode) {
            return (isMainStreamer || streamerId === screenSharerId);
        } else {
            return true
        }
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

    if (!(viewer || joining)) {
        actions.push({
            icon: <HearingIcon fontSize="large" color={automaticMode ? "primary" : "inherit"}/>,
            name: automaticMode ? 'Deactivate automatic speaker Switch' : 'Activate automatic speaker Switch',
            onClick: () => setLivestreamSpeakerSwitchMode(automaticMode ? "manual" : "automatic")
        })
    }

    if (!viewer) {
        actions.push({
            icon: <DynamicFeedIcon fontSize="large" color={presentMode ? "primary" : "inherit"}/>,
            name: presentMode ? 'Stop sharing slides' : 'Share slides',
            onClick: () => setLivestreamMode(presentMode ? "default" : "presentation")
        })
    }

    if (showShareDesktopButton()) {
        actions.push({
            icon: <ScreenShareIcon color={desktopMode ? "primary" : "inherit"}/>,
            name: desktopMode ? 'Stop Sharing Desktop' : 'Share Desktop',
            onClick: () => setDesktopMode(desktopMode ? "default" : "desktop", streamerId)
        })
    }


    return (
        <ClickAwayListener onClickAway={handleClose}>
            <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className={classes.root}>
                <WhiteTooltip
                    placement="top"
                    style={{
                        transition: "transform 0.2s",
                        transitionTimingFunction: theme.transitions.easeInOut,
                        transform: open ? "" : "translate(20px, 0) scale3d(0.8, 0.8, 0.8)",
                    }}
                    title={
                        <React.Fragment>
                            <TooltipTitle>Video Controls</TooltipTitle>
                            <TooltipText>
                                You can mute, share slides and
                                toggle between automatic voice activated switching here.
                            </TooltipText>
                            <TooltipButtonComponent onConfirm={() => {
                                handleOpen()
                                handleConfirm(13)
                            }} buttonText="Ok"/>
                        </React.Fragment>
                    } open={isOpen(13)}>
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
                                tooltipPlacement="left"
                                tooltipTitle={action.name}
                                classes={{staticTooltipLabel: classes.tooltip}}
                                tooltipOpen={Boolean(action.name.length)}
                                FabProps={{
                                    size: "large",
                                    // classes: {root:  classes.actionButton},
                                }}
                                onClick={action.onClick}
                            />
                        ))}
                    </SpeedDial>
                </WhiteTooltip>
            </div>
        </ClickAwayListener>
    )
}

export default withFirebasePage(VideoControlsContainer);