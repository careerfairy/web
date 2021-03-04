import React, {useContext, useEffect, useState} from 'react';
import ForumOutlinedIcon from '@material-ui/icons/ForumOutlined';
import HelpIcon from '@material-ui/icons/Help';
import BarChartIcon from '@material-ui/icons/BarChart';
import PanToolOutlinedIcon from '@material-ui/icons/PanToolOutlined';
import {fade, makeStyles, useTheme} from "@material-ui/core/styles";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import {ClickAwayListener} from "@material-ui/core";
import ChevronLeftRoundedIcon from '@material-ui/icons/ChevronLeftRounded';
import TutorialContext from "../../../../context/tutorials/TutorialContext";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        top: 0,
        width: "120px",
        padding: "30px",
        position: "absolute",
        alignItems: "center",
        transform: "translateY(50%)",
        zIndex: 10000,
        bottom: "50%"
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
    darkActionButton: {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.grey["400"],
        "&:disabled": {
            backgroundColor: fade(theme.palette.background.paper, 0.5),
            color: theme.palette.primary.main,
        },
        "&:hover": {
            backgroundColor: theme.palette.background.default,
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
    darkActionButtonPink: {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.secondary.main,
        "&:hover": {
            backgroundColor: theme.palette.background.default,
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
        const [hasMounted, setHasMounted] = useState(false)
        const theme = useTheme()
        const [open, setOpen] = useState(true);
        const [delayHandler, setDelayHandler] = useState(null)
        const {tutorialSteps, handleConfirmStep} = useContext(TutorialContext);

        useEffect(() => {
            setHasMounted(true)
        }, [])

        const tutorialStepActive = () => {
            return Boolean(isOpen(3) || isOpen(8))
        }
        const isValid = (actionTutorialNum, actionDisabled) => {
            return tutorialSteps[actionTutorialNum] && !actionDisabled
        }

        const isOpen = (actionTutorialNum, actionDisabled) => {
            return tutorialSteps.streamerReady && isValid(actionTutorialNum, actionDisabled)
        }
        const classes = useStyles({open: open || tutorialStepActive(), showMenu, isMobile});

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

        const getActions = () => {
            if (!hasMounted) {
                return []
            }
            const actions = [
                {
                    icon: <BarChartIcon fontSize="large"/>,
                    name: "Polls",
                    disabled: showMenu && selectedState === 'polls',
                    onClick: () => handleStateChange("polls"),
                    tutorialNum: 3
                },
                {
                    icon: <HelpIcon fontSize="large"/>,
                    name: "Q&A",
                    disabled: showMenu && selectedState === 'questions',
                    onClick: () => handleStateChange("questions"),
                    tutorialNum: 2334
                },
            ];

            if (isMobile) {
                actions.unshift({
                    icon: <ForumOutlinedIcon fontSize="large"/>,
                    name: "Chat",
                    disabled: showMenu && selectedState === 'chat',
                    onClick: () => handleStateChange("chat"),
                    tutorialNum: 234
                })
            }
            if (!isMobile) {
                actions.unshift({
                    icon: <PanToolOutlinedIcon/>,
                    name: "Hand Raise",
                    disabled: showMenu && selectedState === 'hand',
                    onClick: () => handleStateChange("hand"),
                    tutorialNum: 8
                })
            }

            if (streamer && showMenu) {
                actions.unshift({
                    icon: <ChevronLeftRoundedIcon fontSize="large"/>,
                    name: "",
                    disabled: false,
                    onClick: () => setShowMenu(!showMenu),
                    tutorialNum: 9999999
                })
            }
            return actions
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
                        {getActions().map((action) => {
                            return (
                                <SpeedDialAction
                                    key={action.tutorialNum}
                                    icon={action.icon}
                                    tooltipPlacement="right"
                                    tooltipTitle={action.name}
                                    classes={{staticTooltipLabel: classes.tooltip}}
                                    tooltipOpen={Boolean(action.name.length)}
                                    onClick={() => {
                                        action.onClick()
                                        isOpen(action.tutorialNum, action.disabled) && handleConfirmStep(action.tutorialNum)
                                    }}
                                    FabProps={{
                                        size: "large",
                                        classes: {
                                            root: clsx({
                                                [classes.actionButtonHighlight]: isOpen(action.tutorialNum, action.disabled),
                                                [classes.actionButton]: action.name.length,
                                                [classes.actionButtonPink]: !action.name.length,
                                                [classes.darkActionButton]: theme.palette.type === "dark",
                                                [classes.darkActionButtonPink]: !action.name.length && theme.palette.type === "dark"
                                            })
                                        },
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