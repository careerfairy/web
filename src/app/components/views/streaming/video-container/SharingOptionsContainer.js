import React, {useState, useEffect, Fragment} from 'react';
import {Grid, Icon, Button} from "semantic-ui-react";
import MicOffIcon from '@material-ui/icons/MicOff';
import MicIcon from '@material-ui/icons/Mic';
import DynamicFeedIcon from '@material-ui/icons/DynamicFeed';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import SettingsOff from '@material-ui/icons/Settings';
import HearingIcon from '@material-ui/icons/Hearing';
import {withFirebasePage} from 'context/firebase';
import {makeStyles} from "@material-ui/core/styles";
import {ClickAwayListener, fade} from "@material-ui/core";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";

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

function SharingOptionsContainer({currentLivestream: {mode, id, speakerSwitchMode}, webRTCAdaptor, viewer, joining, firebase}) {
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

    function setLivestreamMode(mode) {
        firebase.setLivestreamMode(id, mode);
    }

    function setLivestreamSpeakerSwitchMode(mode) {
        firebase.setLivestreamSpeakerSwitchMode(id, mode);
    }

    const presentMode = mode === "presentation"
    const automaticMode = speakerSwitchMode === "automatic"

    const actions = [{
        icon: isLocalMicMuted ? <MicOffIcon fontSize="large" style={{ color: "red" }}/> : <MicIcon fontSize="large" color="primary"/>,
        name: isLocalMicMuted ? 'Unmute microphone' : 'Mute microphone',
        onClick: toggleMicrophone,
    },{
        icon: isVideoInactive ? <VideocamIconOff fontSize="large" style={{ color: "red" }}/> : <VideocamIcon fontSize="large" color="primary"/>,
        name: isVideoInactive ? 'Switch camera on' : 'Switch camera off',
        onClick: toggleVideo,
    }];

    if (!(viewer || joining)) {
        actions.unshift({
            icon: <HearingIcon fontSize="large" color={automaticMode ? "primary" : "inherit"}/>,
            name: automaticMode ? 'Deactivate automatic speaker Switch' : 'Activate automatic speaker Switch',
            onClick: () => setLivestreamSpeakerSwitchMode(automaticMode ? "manual" : "automatic")
        })
    }

    if (!viewer) {
        actions.unshift({
            icon: <DynamicFeedIcon fontSize="large" color={presentMode ? "primary" : "inherit"}/>,
            name: presentMode ? 'Stop sharing slides' : 'Share slides',
            onClick: () => setLivestreamMode(presentMode ? "default" : "presentation")
        })
    }

    if (!viewer) {
        actions.unshift({
            icon: <DynamicFeedIcon fontSize="large" color={presentMode ? "primary" : "inherit"}/>,
            name: presentMode ? 'Stop sharing slides' : 'Share slides',
            onClick: () => setLivestreamMode(presentMode ? "default" : "presentation")
        })
    }

    const test = true

    return test ?
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
            </div>
        </ClickAwayListener>
        :
        (
            <Fragment>
                <div className='right-container'>
                    <Grid columns={1}>
                        <Grid.Row style={{margin: '10px 0'}}>
                            <Grid.Column textAlign='center'>
                                <div className='side-button' onClick={() => toggleMicrophone()}
                                     style={{color: isLocalMicMuted ? 'red' : 'white'}}>
                                    <Icon name='microphone slash' size='large' style={{margin: '0 0 5px 0'}}/>
                                    <p style={{fontSize: '0.8em'}}>{isLocalMicMuted ? 'Unmute' : 'Mute'}</p>
                                </div>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row style={{margin: '10px 0', display: viewer ? 'none' : 'block'}}>
                            <Grid.Column textAlign='center'>
                                <div className='side-button'
                                     onClick={() => setLivestreamMode(mode === "presentation" ? "default" : "presentation")}
                                     style={{color: mode === "presentation" ? 'red' : 'white'}}>
                                    <Icon name='clone outline' size='large' style={{
                                        margin: '0 0 5px 0',
                                        color: mode === "presentation" ? 'red' : 'white'
                                    }}/>
                                    <p style={{
                                        fontSize: '0.8em',
                                        color: mode === "presentation" ? 'red' : 'white'
                                    }}>{mode === "presentation" ? 'Stop Sharing Slides' : 'Share Slides'}</p>
                                </div>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row style={{margin: '10px 0', display: viewer || joining ? 'none' : 'block'}}>
                            <Grid.Column textAlign='center'>
                                <div className='side-button'
                                     onClick={() => setLivestreamSpeakerSwitchMode(speakerSwitchMode === "automatic" ? "manual" : "automatic")}
                                     style={{color: speakerSwitchMode === "automatic" ? 'red' : 'white'}}>
                                    <Icon name='assistive listening systems' size='large'
                                          style={{margin: '0 0 5px 0'}}/>
                                    <p style={{fontSize: '0.8em'}}>{speakerSwitchMode === "automatic" ? 'Automatic Speaker Switch' : 'Manual Speaker Switch'}</p>
                                </div>
                            </Grid.Column>
                        </Grid.Row>
                        {/* <Grid.Row style={{ margin: '10px 0'}}>
                            <Grid.Column textAlign='center'>
                                <div className='side-button' onClick={() => setShowSpeakersModal(true)}>
                                    <Icon name='user plus' size='large' style={{ margin: '0 0 5px 0', color: 'white'}}/>
                                    <p style={{ fontSize: '0.8em', color: 'white' }}>Invite Speakers</p>
                                </div>
                            </Grid.Column>
                        </Grid.Row> */}
                        {/* <Grid.Row style={{ margin: '10px 0'}}>
                            <Grid.Column textAlign='center'>
                                <div className='side-button' onClick={() => setLivestreamMode(mode === "desktop" ? "default" : "desktop")}  style={{  color: mode === "desktop" ? 'red' : 'white' }}>
                                    <Icon name='tv' size='large' style={{ margin: '0 0 5px 0', color: mode === "desktop" ? 'red' : 'white'}}/>
                                    <p style={{ fontSize: '0.8em', color: mode === "desktop" ? 'red' : 'white' }}>{ mode === "desktop" ? 'Stop Sharing Desktop' : 'Share Desktop' }</p>
                                </div>
                            </Grid.Column>
                        </Grid.Row> */}
                    </Grid>
                </div>
                <style jsx>{`
                    .side-button {
                        cursor: pointer;
                    }

                    .right-container {
                        position: absolute;
                        right: 0;
                        top: 0;
                        height: 100%;
                        width: 120px;
                        padding: 20px;
                        background-color: transparent;
                    }
                `}</style>
            </Fragment>
        );
}

export default withFirebasePage(SharingOptionsContainer);