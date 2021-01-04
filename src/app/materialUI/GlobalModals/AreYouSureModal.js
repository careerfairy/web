import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import CircularProgress from '@material-ui/core/CircularProgress';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {makeStyles} from "@material-ui/core/styles";

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
                    <Button disabled={loading} endIcon={loading && <CircularProgress color="inherit" size={20}/>}
                            onClick={handleConfirm} variant="contained" color="primary">
                        Confirm
                    </Button>
                    <Button onClick={handleClose} className={classes.errorButton}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default AreYouSureModal;


