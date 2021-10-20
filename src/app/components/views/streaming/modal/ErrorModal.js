import {
   Button,
   CircularProgress,
   Dialog,
   DialogContent,
   Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ErrorOutline } from "@material-ui/icons";
import React, { useState, useEffect, useRef, memo } from "react";

const useStyles = makeStyles((theme) => ({
   container: {
      position: "relative",
      minHeight: "20vh",
      minWidth: 300,
   },
   content: {
      position: "absolute",
      top: "50%",
      left: "50%",
      width: "100%",
      margin: 0,
      transform: "translate(-50%, -50%)",
      textAlign: "center",
   },
   text: {
      marginTop: 10,
   },
   icon: {
      color: "red",
      marginBottom: 10,
   },
}));

const errorMessages = {
   UNEXPECTED_ERROR:
      "An unexpected error occured. Please contact support for more information.",
};

const AgoraErrorModal = () => {
   const classes = useStyles();
   const dispatch = useDispatch();

   const agoraRtcError = useSelector((state) => {
      return state.stream.agoraState.rtcError;
   });

   return (
      <Dialog open={agoraRtcError}>
         <DialogContent>
            <div className={classes.container}>
               <div className={classes.progress}>
                  <HighlightOffIcon className={classes.icon} />
               </div>
               <div className={classes.content}>
                  {messages[agoraRtcConnectionStatus]}
               </div>
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default AgoraErrorModal;
