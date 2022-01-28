import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { withFirebase } from "context/firebase/FirebaseServiceContext";
import {
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
   TextField,
} from "@material-ui/core";

const StreamerLinksDialogContent = ({
   livestreamId,
   handleClose,
   firebase,
}) => {
   const [secureToken, setSecureToken] = useState(null);

   useEffect(() => {
      firebase.getLivestreamSecureToken(livestreamId).then((doc) => {
         if (doc.exists) {
            let secureToken = doc.data().value;
            setSecureToken(secureToken);
         }
      });
   }, []);

   const createMainStreamerLink = () => {
      let baseUrl = "https://careerfairy.io";
      if (window?.location?.origin) {
         baseUrl = window.location.origin;
      }
      return `${baseUrl}/streaming/${livestreamId}/main-streamer?token=${secureToken}`;
   };

   const createJoiningStreamerLink = () => {
      let baseUrl = "https://careerfairy.io";
      if (window?.location?.origin) {
         baseUrl = window.location.origin;
      }
      return `${baseUrl}/streaming/${livestreamId}/joining-streamer?token=${secureToken}`;
   };

   return (
      <React.Fragment>
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
            <Button size="large" onClick={handleClose}>
               Close
            </Button>
         </DialogActions>
      </React.Fragment>
   );
};

StreamerLinksDialogContent.propTypes = {
   handleClose: PropTypes.func,
   livestreamId: PropTypes.string,
   firebase: PropTypes.shape({
      getLivestreamSecureToken: PropTypes.func,
   }),
};

const StreamerLinksDialog = ({
   firebase,
   livestreamId,
   openDialog,
   onClose,
}) => {
   const handleClose = () => {
      onClose?.();
   };

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
   );
};

StreamerLinksDialog.propTypes = {
   firebase: PropTypes.shape({
      getLivestreamSecureToken: PropTypes.func,
   }),
   onClose: PropTypes.func,
   livestreamId: PropTypes.string,
   openDialog: PropTypes.bool,
   setOpenDialog: PropTypes.func,
};

export default withFirebase(StreamerLinksDialog);
