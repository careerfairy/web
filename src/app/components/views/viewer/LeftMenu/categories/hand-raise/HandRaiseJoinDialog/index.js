import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { GlassDialog } from "../../../../../../../materialUI/GlobalModals";
import {
   Button,
   DialogActions,
   DialogContent,
   Typography,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
   title: {
      fontFamily: "Permanent Marker",
      fontSize: "2em",
      color: theme.palette.primary.main,
   },
}));

const Content = ({ handleClose, requestHandRaise }) => {
   const classes = useStyles();
   return (
      <React.Fragment>
         <DialogContent>
            <Typography className={classes.title} align="center">
               You've been invited to join the stream!
            </Typography>
         </DialogContent>
         <DialogActions>
            <Button children="Cancel" onClick={handleClose} />
            <Button
               variant="contained"
               children="Join now"
               color="primary"
               onClick={requestHandRaise}
            />
         </DialogActions>
      </React.Fragment>
   );
};
const HandRaiseJoinDialog = ({ open, onClose, requestHandRaise }) => {

   const handleClose = () => {
      onClose();
   };

   return (
      <GlassDialog open={open}>
         <Content
            requestHandRaise={requestHandRaise}
            handleClose={handleClose}
         />
      </GlassDialog>
   );
};

export default HandRaiseJoinDialog;
