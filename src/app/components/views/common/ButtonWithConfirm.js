import React, {Fragment, useState} from 'react'
import {Button, DialogContentText} from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import {GlassDialog} from "../../../materialUI/GlobalModals";

function ButtonWithConfirm({color, disabled, buttonAction, buttonLabel, confirmDescription, ...rest}) {

    const [modalOpen, setModalOpen] = useState(false);

    function performConfirmAction() {
        buttonAction();
        setModalOpen(false);
    }

    return (
        <Fragment>
            <Button {...rest} style={{background: color}} color="primary" variant="contained" onClick={() => setModalOpen(true)}
                    disabled={disabled}>{buttonLabel}</Button>
            <GlassDialog open={modalOpen} onClose={() => setModalOpen(false)} centered={false}>
                <DialogTitle>
                    Just making sure
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {confirmDescription}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button startIcon={<ClearIcon/>} variant="contained" basic color='grey'
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