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

const useStyles = makeStyles(theme => ({}));

const ScreenShareModal = ({open, handleClose, handleScreenShare}) => {

    const classes = useStyles()

    return (
        <GlassDialog fullWidth maxWidth="sm" onClose={handleClose} open={open}>
            <DialogTitle>
                Would you like to share:
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                        <GraphicButton
                            buttonTitle="Video"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <GraphicButton
                            buttonTitle="Screen"
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
