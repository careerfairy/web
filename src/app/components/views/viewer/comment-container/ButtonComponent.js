import React, {useState} from 'react';
import ForumOutlinedIcon from '@material-ui/icons/ForumOutlined';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import BarChartIcon from '@material-ui/icons/BarChart';
import PanToolIcon from '@material-ui/icons/PanTool';
import {makeStyles} from "@material-ui/core/styles";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import {ClickAwayListener, fade} from "@material-ui/core";
import ChevronLeftRoundedIcon from '@material-ui/icons/ChevronLeftRounded';

const useStyles = makeStyles((theme) => ({
    root: {
        position: "absolute",
        right: "-200px",
        height: "100%",
        width: 200,
        display: "flex",
        alignItems: "center",
        padding: 30,
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
    }

}));


export const ButtonComponent = ({handleStateChange, showMenu, isMobile, selectedState, streamer, setShowMenu}) => {
    const DELAY = 3000; //3 seconds
    const [open, setOpen] = useState(true);
    const classes = useStyles({open});
    const [delayHandler, setDelayHandler] = useState(null)

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
            icon: <PanToolIcon fontSize="large"/>,
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
                    {actions.map((action) => (
                        <SpeedDialAction
                            key={action.name}
                            icon={action.icon}
                            tooltipPlacement="right"
                            tooltipTitle={action.name}
                            classes={{staticTooltipLabel:  classes.tooltip}}
                            tooltipOpen={Boolean(action.name.length)}
                            FabProps={{
                                size: "large",
                                classes: {root: action.name.length? classes.actionButton : classes.actionButtonPink},
                                disabled: action.disabled
                            }}
                            onClick={action.onClick}
                        />
                    ))}
                </SpeedDial>
            </div>
        </ClickAwayListener>
    )
}
