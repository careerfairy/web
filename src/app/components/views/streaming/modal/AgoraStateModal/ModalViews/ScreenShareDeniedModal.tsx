import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Button, DialogActions, DialogContentText } from "@mui/material";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import RootState from "store/reducers";

const ScreenShareDeniedModal = () => {
   const dispatch = useDispatch();
   const screenSharePermissionDenied = useSelector(
      (state: RootState) => state.stream.agoraState.screenSharePermissionDenied
   );

   const handleClose = () => {
      dispatch(actions.setScreenShareDeniedError(false));
   };

   return (
      <Dialog open={screenSharePermissionDenied}>
         <DialogTitle
            sx={{
               display: "flex",
               justifyContent: "center",
               alignItems: "center",
            }}
         >
            <ScreenShareIcon sx={{ mr: 1 }} />
            Screen Share Not Allowed
         </DialogTitle>
         <DialogContent dividers>
            <DialogContentText>
               Unfortunately, your browser was not allowed to share your screen.
               If you did not actively cancel screen sharing, this indicates
               that your browser is missing the necessary permission for screen
               sharing. Please check your system's Security & Privacy settings
               to authorize your browser to share your screen.
            </DialogContentText>
         </DialogContent>
         <DialogActions>
            <Button color={"grey"} onClick={handleClose}>
               Close
            </Button>
         </DialogActions>
      </Dialog>
   );
};

export default ScreenShareDeniedModal;
