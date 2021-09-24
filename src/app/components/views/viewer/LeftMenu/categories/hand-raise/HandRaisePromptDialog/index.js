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
  contentText:{
     marginBottom: 0
  }
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
               Would you like to request to join with audio and video?
            </DialogContentText>
         </DialogContent>
         <DialogActions>
            <Button children="Cancel" onClick={handleClose} />
            <Button
               variant="contained"
               children="Request to Join"
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
