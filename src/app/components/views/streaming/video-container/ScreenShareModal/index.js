import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {GlassDialog} from "../../../../../materialUI/GlobalModals";
import PropTypes from 'prop-types';
import GraphicButton from "../../../../../materialUI/GlobalButtons/GraphicButton";

import {
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    Box,
    Grid,
    Typography,
    DialogContentText,
} from '@material-ui/core';
import {demoVideo} from "../../../../util/constants";

const useStyles = makeStyles(theme => ({}));

const ScreenShareModal = ({open, handleClose, handleScreenShare}) => {

    const classes = useStyles()

    return (
        <GlassDialog fullWidth maxWidth="sm" onClose={handleClose} open={open}>
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
                            videoUrl={demoVideo}
                            buttonText={
                                "Chose this option if you would" +
                                " like to share content that is fast moving" +
                                " like videos with high frame rates"
                            }
                            backgroundImageUrl={"https://media.giphy.com/media/duzpaTbCUy9Vu/giphy.gif"}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <GraphicButton
                            buttonTitle="Screen"
                            videoUrl={demoVideo}
                            buttonText={
                                "Chose this option if you would like" +
                                " to share your desktop preferring video " +
                                "quality over frame rates"
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
        </GlassDialog>
    );
};
ScreenShareModal.prototypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleScreenShare: PropTypes.func.isRequired
}
export default ScreenShareModal;
