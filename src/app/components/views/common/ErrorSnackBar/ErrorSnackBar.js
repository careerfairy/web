import React from 'react';
import {Slide, Snackbar, SnackbarContent} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    close: {
        padding: theme.spacing(0.5),
    },
}));

function TransitionRight(props) {
    return <Slide {...props} direction="right"/>;
}

const ErrorSnackBar = ({errorMessage, handleClose}) => {
    const classes = useStyles()
    return (
        <Snackbar
            open={Boolean(errorMessage.length)}
            onClose={handleClose}
            autoHideDuration={6000}
            TransitionComponent={TransitionRight}
            key={errorMessage}>
            <SnackbarContent
                style={{backgroundColor: 'red'}}
                message={errorMessage}
                action={
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        className={classes.close}
                        onClick={handleClose}>
                        <CloseIcon/>
                    </IconButton>
                }/>
        </Snackbar>
    );
};

export default ErrorSnackBar;
