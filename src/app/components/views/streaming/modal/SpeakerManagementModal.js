import React from 'react';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import CheckIcon from '@material-ui/icons/Check';
import Dialog from '@material-ui/core/Dialog';
import {withFirebase} from 'context/firebase';
import {DialogContentText, DialogTitle, Typography, Slide} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import {GlassDialog} from "../../../../materialUI/GlobalModals";

function SpeakerManagementModal({open, setOpen, joiningStreamerLink}) {

    return (
        <GlassDialog TransitionComponent={Slide} fullWidth onClose={() => setOpen(false)} open={open}>
            <DialogTitle disableTypography
                         style={{display: "flex", justifyContent: "center", alignItems: "flex-end"}} align="center">
                <PersonAddIcon style={{marginRight: "1rem"}} fontSize="large"/> <Typography
                style={{fontSize: "1.8em", fontWeight: 500}} variant="h3">Invite additional
                speakers</Typography>
            </DialogTitle>
            <MuiDialogContent dividers>
                <DialogContentText>
                    You can invite up to 6 speakers to join your
                    stream. You should do this before starting your stream, to ensure that all streamer have joined
                    before the event starts. When an invited speaker has successfully joined, you will be able to see
                    and hear him/her in the stream overview.
                </DialogContentText>
                <TextField
                    variant="outlined"
                    fullWidth
                    autoFocus
                    InputProps={{readOnly: true}}
                    value={joiningStreamerLink}
                />
            </MuiDialogContent>
            <MuiDialogActions>
                <Button
                    children="OK"
                    variant="contained"
                    color="primary"
                    startIcon={<CheckIcon/>}
                    onClick={() => setOpen(false)}
                />
            </MuiDialogActions>
        </GlassDialog>
    )
}

export default withFirebase(SpeakerManagementModal);