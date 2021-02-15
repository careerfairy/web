import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {GlassDialog} from "../../../../../materialUI/GlobalModals";
import PropTypes from 'prop-types';
import GraphicButton from "../../../../../materialUI/GlobalButtons/GraphicButton";

import {Button, DialogActions, DialogContent, DialogTitle, Grid, Typography,} from '@material-ui/core';
import {demoSlides, demoVideo} from "../../../../util/constants";

const useStyles = makeStyles(theme => ({}));

const ScreenShareModal = ({open, handleClose, handleScreenShare}) => {

    const classes = useStyles()

    const handleClick = (optimizationMode = "detail") => {
        handleScreenShare(optimizationMode)
        handleClose()
    }

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
                            onClick={() => handleClick("motion")}
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
        </GlassDialog>
    );
};
ScreenShareModal.prototypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleScreenShare: PropTypes.func.isRequired
}
export default ScreenShareModal;
