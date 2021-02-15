import React, {useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {GlassDialog} from "../../../../../materialUI/GlobalModals";
import PropTypes from 'prop-types';
import GraphicButton from "../../../../../materialUI/GlobalButtons/GraphicButton";

import {
    Button,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    Grow,
    Typography,
} from '@material-ui/core';
import {demoSlides, demoVideo} from "../../../../util/constants";

const sharAudioDemo = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/background-videos%2Fshare-audio-demo.mp4?alt=media&token=d5f55a31-ecbe-4c6a-9689-b7d11ddaf59d"
const useStyles = makeStyles(theme => ({
    shareAudioVideo: {
        maxWidth: 550
    }
}));

const ScreenShareModal = ({open, handleClose, handleScreenShare}) => {

    const [showShareAudioHint, setShowShareAudioHint] = useState(false);
    const classes = useStyles()

    const handleClick = (optimizationMode = "detail") => {
        handleScreenShare(optimizationMode)
        closeScreenShareModal()
    }

    const closeScreenShareModal = () => {
        setShowShareAudioHint(false)
        handleClose()
    }

    const toggleShowShareAudioHint = () => {
        setShowShareAudioHint(!showShareAudioHint)
    }


    return (
        <GlassDialog fullWidth maxWidth="sm" onClose={closeScreenShareModal} open={open}>
            {showShareAudioHint ?
                <Grow in>
                    <div>
                        <DialogTitle>
                            <Typography align="center" variant="h4">
                                When Sharing a video
                            </Typography>
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText color="textPrimary">
                                <ol>
                                    <li>
                                        After clicking "Proceed", please click "Chrome Tabs"
                                    </li>
                                    <li>
                                        Select the tab with the video
                                    </li>
                                    <li>
                                        Make sure the share audio checkbox is checked
                                    </li>
                                    <li>
                                        Click share!
                                    </li>
                                </ol>
                            </DialogContentText>
                            <Grid container spacing={1}>
                                <Grid item xs={12} sm={12}>
                                    <video
                                        className={classes.shareAudioVideo}
                                        src={sharAudioDemo}
                                        loop autoPlay
                                        controls={false}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={toggleShowShareAudioHint}>
                                Back
                            </Button>
                            <Button variant="contained" color="primary" onClick={() => handleClick("motion")}>
                                Proceed
                            </Button>
                        </DialogActions>
                    </div>
                </Grow>
                :
                <Grow in>
                    <div>
                        <DialogTitle>
                            <Typography align="center" variant="h4">
                                Would you like to share
                            </Typography>
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={1}>
                                <Grid item xs={12} sm={6}>
                                    <GraphicButton
                                        buttonTitle="Video"
                                        onClick={toggleShowShareAudioHint}
                                        videoUrl={demoVideo}
                                        buttonText={
                                            "Chose this option if you would" +
                                            " like to share a fluid video"
                                        }
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <GraphicButton
                                        buttonTitle="Screen"
                                        videoUrl={demoSlides}
                                        onClick={() => handleClick("detail")}
                                        buttonText={
                                            "Chose this option if you would like" +
                                            " to share a screen in high detail "
                                        }
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose}>
                                Close
                            </Button>
                        </DialogActions>
                    </div>
                </Grow>
            }
        </GlassDialog>
    );
};
ScreenShareModal.prototypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleScreenShare: PropTypes.func.isRequired
}
export default ScreenShareModal;
