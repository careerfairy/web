import React from 'react';
import {makeStyles} from "@material-ui/core/styles";

import {
    Button,
    Dialog,
    CircularProgress,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    errorButton: {
        background: theme.palette.error.main,
        color: theme.palette.error.contrastText
    }
}))
const AreYouSureModal = ({title = "Are you sure?", message, handleConfirm, open, handleClose, loading}) => {
    const classes = useStyles()

    return (
        <div>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button disabled={loading} endIcon={loading && <CircularProgress color="inherit" size={20}/>}
                            onClick={handleConfirm} variant="contained" color="primary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default AreYouSureModal;


