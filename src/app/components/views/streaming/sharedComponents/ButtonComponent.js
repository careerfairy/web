import React, {useContext, useState} from 'react';
import ForumOutlinedIcon from '@material-ui/icons/ForumOutlined';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import BarChartIcon from '@material-ui/icons/BarChart';
import PanToolOutlinedIcon from '@material-ui/icons/PanToolOutlined';
import {makeStyles} from "@material-ui/core/styles";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import {ClickAwayListener, fade} from "@material-ui/core";
import ChevronLeftRoundedIcon from '@material-ui/icons/ChevronLeftRounded';
import TutorialContext from "../../../../context/tutorials/TutorialContext";
import {TooltipButtonComponent, TooltipText, TooltipTitle, WhiteTooltip} from "../../../../materialUI/GlobalTooltips";
import Grow from "@material-ui/core/Grow";

const useStyles = makeStyles((theme) => ({
    root: {
        position: "absolute",
        right: ({showMenu, isMobile}) => showMenu ? isMobile ? "-120px" : "-120px" : "-120px",
        height: "100%",
        width: 120,
        display: "flex",
        alignItems: "center",
        padding: 30,
        top: 0,
    },
    speedDial: {
        transition: "transform 0.2s",
        transitionTimingFunction: theme.transitions.easeInOut,
        transform: ({open}) => open ? "" : "translate(-20px, 0) scale3d(0.8, 0.8, 0.8)",
        "-moz-transform": ({open}) => open ? "" : "translate(-20px, 0) scale3d(0.8, 0.8, 0.8)",
        "-o-transform": ({open}) => open ? "" : "translate(-20px, 0) scale3d(0.8, 0.8, 0.8)",
        "-webkit-transform": ({open}) => open ? "" : "translate(-20px, 0) scale3d(0.8, 0.8, 0.8)",
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
    actionButtonPink: {
        backgroundColor: theme.palette.secondary.main,
        color: "white",
        "&:disabled": {
            backgroundColor: fade(theme.palette.secondary.main, 0.5),
            color: "white",
        },
        "&:hover": {
            backgroundColor: theme.palette.secondary.dark,
        },
    },
    cardHovered: {},
    tooltip: {
        transition: "all 0.6s",
        transitionTimingFunction: theme.transitions.easeInOut,
        display: ({open}) => open ? "block" : "none",
        whiteSpace: "nowrap"
    },
    dialButton: {
        display: "none"
    },
    "@-webkit-keyframes blink": {
        "50%": {
            borderColor: theme.palette.secondary.main
        }
    },
    "@keyframes blink": {
        "50%": {
            borderColor: theme.palette.secondary.main
        }
    },
    highlight: {},
    actionButtonHighlight: {
        backgroundColor: theme.palette.primary.main,
        border: "4px solid transparent",
        animation: "$blink .5s step-end infinite alternate",
        "-webkit-animation": "$blink .5s step-end infinite alternate",
        color: "white",
        "&:disabled": {
            backgroundColor: fade(theme.palette.primary.main, 0.5),
            color: "white",
        },
        "&:hover": {
            backgroundColor: theme.palette.primary.dark,
        },
    },

}));


const ButtonComponent =
    ({
         handleStateChange,
         showMenu,
         isMobile,
         selectedState,
         streamer,
         setShowMenu
     }) => {
        const DELAY = 3000; //3 seconds
        const [open, setOpen] = useState(true);
        const classes = useStyles({open, showMenu, isMobile});
        const [delayHandler, setDelayHandler] = useState(null)
        const {tutorialSteps, setTutorialSteps} = useContext(TutorialContext);

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

        if (isMobile && showMenu) {
            return null;
        }

        const isPolls = (actionName) => {
            return actionName === "Polls" && tutorialSteps[3] && selectedState !== "polls"
        }

        const isOpen = (actionName) => {
            return tutorialSteps.streamerReady && isPolls(actionName)
        }


        const handleConfirm = (property) => {
            setTutorialSteps({
                ...tutorialSteps,
                [property]: false,
                [property + 1]: true,
            })
        }

        const actions = [
            {
                icon: <BarChartIcon fontSize="large"/>,
                name: "Polls",
                disabled: showMenu && selectedState === 'polls',
                onClick: () => handleStateChange("polls")
            },
            {
                icon: <HelpOutlineIcon fontSize="large"/>,
                name: "Q&A",
                disabled: showMenu && selectedState === 'questions',
                onClick: () => handleStateChange("questions")
            },
        ];

        if (isMobile) {
            actions.unshift({
                icon: <ForumOutlinedIcon fontSize="large"/>,
                name: "Chat",
                disabled: showMenu && selectedState === 'chat',
                onClick: () => handleStateChange("chat")
            })
        } else {
            actions.unshift({
                icon: <PanToolOutlinedIcon fontSize="large"/>,
                name: "Hand Raise",
                disabled: showMenu && selectedState === 'hand',
                onClick: () => handleStateChange("hand")
            })
        }

        if (streamer && showMenu) {
            actions.unshift({
                icon: <ChevronLeftRoundedIcon fontSize="large"/>,
                name: "",
                disabled: false,
                onClick: () => setShowMenu(!showMenu)
            })
        }

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
                        {actions.map((action) => {
                            console.log("-> isOpen(action)", isOpen(action));
                            return (
                                <SpeedDialAction
                                    key={action.name}
                                    icon={action.icon}
                                    tooltipPlacement="right"
                                    tooltipTitle={action.name}
                                    classes={{staticTooltipLabel: classes.tooltip}}
                                    tooltipOpen={Boolean(action.name.length)}
                                    onClick={action.onClick}
                                    FabProps={{
                                        size: "large",
                                        classes: {root: action.name.length ? isOpen(action.name) ? classes.actionButtonHighlight : classes.actionButton : classes.actionButtonPink},
                                        disabled: action.disabled,
                                    }}
                                />
                            )
                        })}
                    </SpeedDial>
                </div>
            </ClickAwayListener>
        )
    }


export default ButtonComponent