import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { GlassDialog } from "../../../../../../../materialUI/GlobalModals";
import {
   Button,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
   Slide,
   Typography,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
   title: {
      fontFamily: "Permanent Marker",
      fontSize: "2rem",
      color: theme.palette.primary.main,
   },
   contentText: {
      marginBottom: 0,
   },
}));

const Content = ({ handleClose, requestHandRaise }) => {
   const classes = useStyles();
   return (
      <React.Fragment>
         <DialogTitle>
            <Typography className={classes.title} align="center">
               Hand Raise
            </Typography>
         </DialogTitle>
         <DialogContent dividers>
            <DialogContentText className={classes.contentText}>
               The hosts would like for you to see and hear you, would you like
               to request to <b>join with audio and video</b>?
            </DialogContentText>
         </DialogContent>
         <DialogActions>
            <Button children="No Thanks" onClick={handleClose} />
            <Button
               variant="contained"
               children="Request to Join with video and audio"
               color="primary"
               onClick={requestHandRaise}
            />
         </DialogActions>
      </React.Fragment>
   );
};
const HandRaisePromptDialog = ({ open, onClose, requestHandRaise }) => {
   const handleClose = () => {
      onClose();
   };

   return (
      <GlassDialog TransitionComponent={Slide} open={open}>
         <Content
            handleClose={handleClose}
            requestHandRaise={requestHandRaise}
         />
      </GlassDialog>
   );
};

export default HandRaisePromptDialog;
