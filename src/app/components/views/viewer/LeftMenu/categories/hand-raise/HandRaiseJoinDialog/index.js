import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { GlassDialog } from "../../../../../../../materialUI/GlobalModals";
import {
   Button,
   DialogActions,
   DialogTitle,
   Grow,
   Typography,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
   title: {
      fontFamily: "Permanent Marker",
      fontSize: "2rem",
      color: theme.palette.primary.main,
   },
}));

const Content = ({
   handleClose,
   startConnectingHandRaise,
}) => {
   const classes = useStyles();
   return (
      <React.Fragment>
         <DialogTitle>
            <Typography className={classes.title} align="center">
               You've been invited to join with audio and video!
            </Typography>
         </DialogTitle>
         <DialogActions>
            <Button children="Cancel" onClick={handleClose} />
            <Button
               variant="contained"
               children="Join now"
               color="primary"
               onClick={startConnectingHandRaise}
            />
         </DialogActions>
      </React.Fragment>
   );
};
const HandRaiseJoinDialog = ({
   open,
   onClose,
   startConnectingHandRaise,
}) => {
   const handleClose = () => {
      onClose();
   };

   return (
      <GlassDialog TransitionComponent={Grow} open={open}>
         <Content
            handleClose={handleClose}
            startConnectingHandRaise={startConnectingHandRaise}
         />
      </GlassDialog>
   );
};

export default HandRaiseJoinDialog;
