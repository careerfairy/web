import React, {Fragment, useState} from 'react'
import {
    Button,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Tooltip,
    useMediaQuery,
} from "@material-ui/core";
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import {GlassDialog} from "../../../materialUI/GlobalModals";
import {makeStyles, useTheme} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    iconInButton: {
        color: ({hasStarted}) => hasStarted ? theme.palette.error.main : theme.palette.primary.main
    }
}))

function ButtonWithConfirm({
                               color,
                               disabled,
                               buttonAction,
                               mobile,
                               buttonLabel,
                               hasStarted,
                               confirmDescription,
                               tooltipTitle,
                               ...rest
                           }) {
    const theme = useTheme()
    const extraSmallScreen = useMediaQuery(theme.breakpoints.down('xs'))
    const classes = useStyles({hasStarted})
    const [modalOpen, setModalOpen] = useState(false);

    function performConfirmAction() {
        buttonAction();
        setModalOpen(false);
    }

    return (
        <Fragment>
            <Tooltip title={tooltipTitle}>
                {extraSmallScreen ?
                    <IconButton className={classes.iconInButton} disabled={disabled} onClick={() => setModalOpen(true)}>
                        {rest.startIcon}
                    </IconButton>
                    :
                    <span>
                    <Button
                        style={{background: color}} color="primary" variant="contained"
                        startIcon={rest.startIcon}
                        onClick={() => setModalOpen(true)}
                        disabled={disabled}
                    >
                        {buttonLabel}
                    </Button>
                    </span>
                }
            </Tooltip>
            <GlassDialog open={modalOpen} onClose={() => setModalOpen(false)}>
                <DialogTitle>
                    Just making sure
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {confirmDescription}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button startIcon={<ClearIcon/>} variant="contained"
                            onClick={() => setModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button startIcon={<CheckIcon/>} variant="contained" color="primary" onClick={performConfirmAction}>
                        Confirm
                    </Button>
                </DialogActions>
            </GlassDialog>
        </Fragment>
    );
}

export default ButtonWithConfirm;