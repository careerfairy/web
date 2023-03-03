import PropTypes from "prop-types"
import React, { useEffect, useMemo, useState } from "react"
import { withFirebase } from "context/firebase/FirebaseServiceContext"
import {
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
   Grid,
   TextField,
} from "@mui/material"
import CopyLinkButton from "components/views/common/CopyLinkButton"
import { buildStreamerLink } from "util/streamUtil"

const StreamerLinksDialogContent = ({
   livestreamId,
   handleClose,
   firebase,
}) => {
   const [secureToken, setSecureToken] = useState(null)

   useEffect(() => {
      firebase.getLivestreamSecureToken(livestreamId).then((doc) => {
         if (doc.exists) {
            let secureToken: string = doc.data().value
            setSecureToken(secureToken)
         }
      })
   }, [])

   const mainStreamerLink = useMemo(
      () => buildStreamerLink("main-streamer", livestreamId, secureToken),
      [livestreamId, secureToken]
   )
   const joiningStreamerLink = useMemo(
      () => buildStreamerLink("joining-streamer", livestreamId, secureToken),
      [livestreamId, secureToken]
   )

   return (
      <React.Fragment>
         <DialogTitle id="form-dialog-title">Streamer Links</DialogTitle>
         <DialogContent>
            <DialogContentText>
               Send these links to the streamers of this event.
            </DialogContentText>
            <Grid container spacing={2} alignItems="flex-end">
               <Grid item xs={12} sm={10}>
                  <TextField
                     autoFocus
                     InputProps={{
                        readOnly: true,
                     }}
                     value={mainStreamerLink}
                     margin="dense"
                     id="name"
                     label="Main Streamer Link"
                     type="text"
                     fullWidth
                     disabled
                  />
               </Grid>
               <Grid item xs={12} sm={2}>
                  <CopyLinkButton linkUrl={mainStreamerLink} />
               </Grid>
               <Grid item xs={12} sm={10}>
                  <TextField
                     autoFocus
                     InputProps={{
                        readOnly: true,
                     }}
                     value={joiningStreamerLink}
                     margin="dense"
                     id="name"
                     label="Secondary Streamer Link"
                     type="text"
                     fullWidth
                     disabled
                  />
               </Grid>
               <Grid item xs={12} sm={2}>
                  <CopyLinkButton linkUrl={joiningStreamerLink} />
               </Grid>
            </Grid>
         </DialogContent>
         <DialogActions>
            <Button size="large" onClick={handleClose}>
               Close
            </Button>
         </DialogActions>
      </React.Fragment>
   )
}

StreamerLinksDialogContent.propTypes = {
   handleClose: PropTypes.func,
   livestreamId: PropTypes.string,
   firebase: PropTypes.shape({
      getLivestreamSecureToken: PropTypes.func,
   }),
}

const StreamerLinksDialog = ({
   firebase,
   livestreamId,
   openDialog,
   onClose,
}) => {
   const handleClose = () => {
      onClose?.()
   }

   return (
      <Dialog
         open={openDialog}
         onClose={handleClose}
         fullWidth={true}
         maxWidth={"md"}
         aria-labelledby="form-dialog-title"
      >
         <StreamerLinksDialogContent
            livestreamId={livestreamId}
            handleClose={handleClose}
            firebase={firebase}
         />
      </Dialog>
   )
}

StreamerLinksDialog.propTypes = {
   firebase: PropTypes.shape({
      getLivestreamSecureToken: PropTypes.func,
   }),
   onClose: PropTypes.func,
   livestreamId: PropTypes.string,
   openDialog: PropTypes.bool,
   setOpenDialog: PropTypes.func,
}

export default withFirebase(StreamerLinksDialog)
