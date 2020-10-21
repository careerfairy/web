import {useState, useEffect, Fragment} from 'react';
import {Grid, Icon, Button} from "semantic-ui-react";

import {withFirebasePage} from 'context/firebase';
import {makeStyles} from "@material-ui/core/styles";
import {fade} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    root: {
        position: "absolute",
        right: 0,
        top: 0,
        height: "100%",
        width: 120,
        padding: 20,
        backgroundColor: "transparent",
        display: "flex",
        alignItems: "center"
    },
    speedDial: {
        marginRight: theme.spacing(3),
        transition: "transform 0.2s",
        transitionTimingFunction: theme.transitions.easeInOut,
        transform: ({open}) => open ? "" : "translate(30px, 0) scale3d(0.6, 0.6, 0.6)",
        "-moz-transform": ({open}) => open ? "" : "translate(30px, 0) scale3d(0.6, 0.6, 0.6)",
        "-o-transform": ({open}) => open ? "" : "translate(30px, 0) scale3d(0.6, 0.6, 0.6)",
        "-webkit-transform": ({open}) => open ? "" : "translate(30px, 0) scale3d(0.6, 0.6, 0.6)",
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
        transition: "all 0.6s",
        transitionTimingFunction: theme.transitions.easeInOut,
        display: ({open}) => open ? "block" : "none"
    },
    dialButton: {
        display: "none"
    }

}));

function VideoControlsContainer(props) {
    const classes = useStyles()

    const [isLocalMicMuted, setIsLocalMicMuted] = useState(false);

    function setLivestreamMode(mode) {
        props.firebase.setLivestreamMode(props.currentLivestream.id, mode);
    }

    function setLivestreamSpeakerSwitchMode(mode) {
        props.firebase.setLivestreamSpeakerSwitchMode(props.currentLivestream.id, mode);
    }

    function toggleMicrophone() {
        if (isLocalMicMuted) {
            props.webRTCAdaptor.unmuteLocalMic();
        } else {
            props.webRTCAdaptor.muteLocalMic();
        }
        setIsLocalMicMuted(!isLocalMicMuted);
    }

    const test = true

    return test ?
        <div className={classes.root}>

        </div>
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
                        <Grid.Row style={{margin: '10px 0', display: props.viewer ? 'none' : 'block'}}>
                            <Grid.Column textAlign='center'>
                                <div className='side-button'
                                     onClick={() => setLivestreamMode(props.currentLivestream.mode === "presentation" ? "default" : "presentation")}
                                     style={{color: props.currentLivestream.mode === "presentation" ? 'red' : 'white'}}>
                                    <Icon name='clone outline' size='large' style={{
                                        margin: '0 0 5px 0',
                                        color: props.currentLivestream.mode === "presentation" ? 'red' : 'white'
                                    }}/>
                                    <p style={{
                                        fontSize: '0.8em',
                                        color: props.currentLivestream.mode === "presentation" ? 'red' : 'white'
                                    }}>{props.currentLivestream.mode === "presentation" ? 'Stop Sharing Slides' : 'Share Slides'}</p>
                                </div>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row style={{margin: '10px 0', display: props.viewer || props.joining ? 'none' : 'block'}}>
                            <Grid.Column textAlign='center'>
                                <div className='side-button'
                                     onClick={() => setLivestreamSpeakerSwitchMode(props.currentLivestream.speakerSwitchMode === "automatic" ? "manual" : "automatic")}
                                     style={{color: props.currentLivestream.speakerSwitchMode === "automatic" ? 'red' : 'white'}}>
                                    <Icon name='assistive listening systems' size='large'
                                          style={{margin: '0 0 5px 0'}}/>
                                    <p style={{fontSize: '0.8em'}}>{props.currentLivestream.speakerSwitchMode === "automatic" ? 'Automatic Speaker Switch' : 'Manual Speaker Switch'}</p>
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
                                <div className='side-button' onClick={() => setLivestreamMode(props.currentLivestream.mode === "desktop" ? "default" : "desktop")}  style={{  color: props.currentLivestream.mode === "desktop" ? 'red' : 'white' }}>
                                    <Icon name='tv' size='large' style={{ margin: '0 0 5px 0', color: props.currentLivestream.mode === "desktop" ? 'red' : 'white'}}/>
                                    <p style={{ fontSize: '0.8em', color: props.currentLivestream.mode === "desktop" ? 'red' : 'white' }}>{ props.currentLivestream.mode === "desktop" ? 'Stop Sharing Desktop' : 'Share Desktop' }</p>
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

export default withFirebasePage(VideoControlsContainer);