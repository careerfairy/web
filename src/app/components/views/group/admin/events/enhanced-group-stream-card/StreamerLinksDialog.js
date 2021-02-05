import React, {Fragment, useState, useEffect} from 'react';
import {withFirebase} from 'context/firebase';
import {makeStyles} from "@material-ui/core/styles";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@material-ui/core';

const useStyles = makeStyles(theme => {
    return ({
        
    })
})
const StreamerLinksDialog = ({firebase, livestreamId, openDialog, setOpenDialog}) => {

    const classes = useStyles()
    const [secureToken, setSecureToken] = useState(null)

    const handleClose = () => {
        setOpenDialog(false)
    }

    useEffect(() => {
        firebase.getLivestreamSecureToken(livestreamId).then( doc => {
            if (doc.exists) {
                let secureToken = doc.data().value
                setSecureToken(secureToken);
            }      
        })
    },[])

    const createMainStreamerLink = () => {
        let baseUrl = "https://careerfairy.io";
        if (window?.location?.origin) {
            baseUrl = window.location.origin;
        }
        return `${baseUrl}/streaming/${livestreamId}/main-streamer?token=${secureToken}`;  
    }

    const createJoiningStreamerLink = () => {
        let baseUrl = "https://careerfairy.io";
        if (window?.location?.origin) {
            baseUrl = window.location.origin;
        }
        return `${baseUrl}/streaming/${livestreamId}/joining-streamer?token=${secureToken}`;  
    }

    return (
          <Dialog open={openDialog} onClose={handleClose} fullWidth={true} maxWidth={'md'} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Streamer Links</DialogTitle>
            <DialogContent>
            <DialogContentText>
                Send these links to the streamers of this event.
            </DialogContentText>
            <TextField
                autoFocus
                InputProps={{
                    readOnly: true,
                }}
                value={createMainStreamerLink()}
                margin="dense"
                id="name"
                label="Main Streamer Link"
                type="text"
                fullWidth
            />
            <TextField
                autoFocus
                InputProps={{
                    readOnly: true,
                }}
                value={createJoiningStreamerLink()}
                margin="dense"
                id="name"
                label="Secondary Streamer Link"
                type="text"
                fullWidth
            />
            </DialogContent>
            <DialogActions>
                <Button
                    size="large"
                    onClick={handleClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog> 
    );
}

export default withFirebase(StreamerLinksDialog);