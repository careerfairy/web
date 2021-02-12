import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {GlassDialog} from "../../../../../materialUI/GlobalModals";
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogTitle from "@material-ui/core/DialogTitle"
import Button from "@material-ui/core/Button"
import PropTypes from 'prop-types';
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import DialogContentText from "@material-ui/core/DialogContentText";
import GraphicButton from "../../../../../materialUI/GlobalButtons/GraphicButton";

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
