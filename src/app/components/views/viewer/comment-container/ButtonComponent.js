import React, {Fragment, useState} from 'react';
import {Button} from "semantic-ui-react";
import ForumOutlinedIcon from '@material-ui/icons/ForumOutlined';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import BarChartIcon from '@material-ui/icons/BarChart';
import PanToolIcon from '@material-ui/icons/PanTool';
import {makeStyles} from "@material-ui/core/styles";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import {amber} from "@material-ui/core/colors";
import {fade} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    root: {
        position: "absolute",
        right: "-200px",
        top: "50%",
        transform: "translateY(-50%)",
        height: "100%",
        width: "200px",
        display: "flex",
        alignItems: "center"
    },
    speedDial: {
        marginLeft: theme.spacing(3),
        transform: ({open}) => open ? "" : "translate(0, -120px)",
        transition: "transform 0.2s ease-in"
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
}));


export const ButtonComponent = ({handleStateChange, showMenu, isMobile, selectedState}) => {
    const [open, setOpen] = useState(true);
    const classes = useStyles({open});
    const [hidden, setHidden] = useState(false);

    const handleVisibility = () => {
        setHidden((prevHidden) => !prevHidden);
    };

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
            icon: <HelpOutlineIcon fontSize="large"/>,
            name: "Q&A",
            disabled: showMenu && selectedState === 'questions',
            onClick: () => handleStateChange("questions")
        },
        {
            icon: <BarChartIcon fontSize="large"/>,
            name: "Polls",
            disabled: showMenu && selectedState === 'polls',
            onClick: () => handleStateChange("polls")
        },
    ];

    if (isMobile) {
        actions.push({
            icon: <ForumOutlinedIcon fontSize="large"/>,
            name: "Chat",
            disabled: showMenu && selectedState === 'chat',
            onClick: () => handleStateChange("chat")
        })
    } else {
        actions.push({
            icon: <PanToolIcon/>,
            name: "Hand Raise",
            disabled: showMenu && selectedState === 'hand',
            onClick: () => handleStateChange("hand")
        })
    }

    const test = true

    return test ?
        <div className={classes.root}>
            <SpeedDial
                ariaLabel="interaction-selector"
                className={classes.speedDial}
                hidden={hidden}
                FabProps={{onClick: handleToggle}}
                icon={<SpeedDialIcon/>}
                onMouseEnter={handleOpen}
                onFocus={handleOpen}
                //onClose={handleClose}
                // onClick={handleToggle}
                //onOpen={handleOpen}
                open={open}
            >
                {actions.map((action) => (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipPlacement="right"
                        tooltipTitle={action.name}
                        tooltipOpen
                        FabProps={{
                            size: "large",
                            classes: {root: classes.actionButton},
                            disabled: action.disabled
                        }}
                        onClick={action.onClick}
                    />
                ))}
            </SpeedDial>
        </div>
        :
        (
            <Fragment>
                <div className='interaction-selector'>
                    <div className='interaction-selectors'>
                        {
                            isMobile ?
                                <div>
                                    <Button circular size='big' icon='comments outline'
                                            disabled={showMenu && selectedState === 'chat'}
                                            onClick={() => handleStateChange("chat")} color='teal'/>
                                    <span onClick={() => handleStateChange("chat")}>Chat</span>
                                </div> :
                                null
                        }
                        <div>
                            <Button circular size='big' icon='question circle outline'
                                    disabled={showMenu && selectedState === 'questions'}
                                    onClick={() => handleStateChange("questions")} color='teal'/>
                            <span onClick={() => handleStateChange("questions")}>Q&A</span>
                        </div>
                        <div>
                            <Button circular size='big' icon='chart bar outline'
                                    disabled={showMenu && selectedState === 'polls'}
                                    onClick={() => handleStateChange("polls")} color='teal'/>
                            <span onClick={() => handleStateChange("polls")}>Polls</span>
                        </div>
                        {
                            !isMobile ?
                                <div>
                                    <Button circular size='big' icon='hand pointer outline'
                                            disabled={showMenu && selectedState === 'hand'}
                                            onClick={() => handleStateChange("hand")} color='teal'/>
                                    <span onClick={() => handleStateChange("hand")}>Hand Raise</span>
                                </div> :
                                null
                        }
                        {/* <div>
                            <Button circular size='big' icon='cog' onClick={() => setShowMenu(!showMenu)} secondary/>
                            <span style={{ opacity: showLabels ? '1' : '0' }} onClick={() => handleStateChange("settings")}>Settings</span>
                        </div> */}
                        {/* <div className={ showMenu ? '' : 'hidden' }>
                            <Button circular size='big' icon={'angle left'} onClick={() => setShowMenu(!showMenu)}/>
                        </div> */}
                    </div>
                </div>
                <style jsx>{`
                    .hidden {
                        display: none;
                    }

                    .interaction-selector {
                        position: absolute;
                        right: -200px;
                        top: 50%;
                        transform: translateY(-50%);
                        height: 100%;
                        cursor: pointer;
                        width: 200px;
                        background: linear-gradient(90deg, rgba(42,42,42,1) 0%, rgba(60,60,60,0) 100%);
                    }

                    .interaction-selectors {
                        position: absolute;
                        right: 0;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 100%;
                        padding: 20px;
                    }

                    .interaction-selector div {
                        margin: 0 0 15px 0;
                    }

                    .interaction-selector span {
                        color: white;
                        margin-left: 10px;
                        font-weight: 600;
                    }
                `}</style>
            </Fragment>
        )
}
