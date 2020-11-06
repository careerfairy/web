import React, {useState, useContext, Fragment, useEffect} from 'react';
import {Grid, Icon, Button} from "semantic-ui-react";
import MicOffIcon from '@material-ui/icons/MicOff';
import MicIcon from '@material-ui/icons/Mic';
import DynamicFeedIcon from '@material-ui/icons/DynamicFeed';
import HearingIcon from '@material-ui/icons/Hearing';
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
        right: 0,
        top: 0,
        height: "100%",
        width: 120,
        padding: 30,
        backgroundColor: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        zIndex: 9999,
    },
    speedDial: {
        transition: "transform 0.2s",
        transitionTimingFunction: theme.transitions.easeInOut,
        transform: ({open}) => open ? "" : "translate(20px, 0) scale3d(0.8, 0.8, 0.8)",
        "-moz-transform": ({open}) => open ? "" : "translate(20px, 0) scale3d(0.8, 0.8, 0.8)",
        "-o-transform": ({open}) => open ? "" : "translate(20px, 0) scale3d(0.8, 0.8, 0.8)",
        "-webkit-transform": ({open}) => open ? "" : "translate(20px, 0) scale3d(0.8, 0.8, 0.8)",
    },
    actionButton: {
        backgroundColor: theme.palette.primary.main,
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


    function setLivestreamMode(mode) {
        firebase.setLivestreamMode(id, mode);
    }

    function setLivestreamSpeakerSwitchMode(mode) {
        firebase.setLivestreamSpeakerSwitchMode(id, mode);
    }

    function toggleMicrophone() {
        if (isLocalMicMuted) {
            webRTCAdaptor.unmuteLocalMic();
        } else {
            webRTCAdaptor.muteLocalMic();
        }
        setIsLocalMicMuted(!isLocalMicMuted);
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
            icon: isLocalMicMuted ? <MicOffIcon fontSize="large"/> : <MicIcon fontSize="large" color="primary"/>,
            name: isLocalMicMuted ? 'Turn mic on' : 'Turn mic off',
            onClick: toggleMicrophone,
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