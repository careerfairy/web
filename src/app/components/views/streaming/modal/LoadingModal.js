import { CircularProgress, Dialog, DialogContent } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useState, useEffect, useRef } from "react";

const useStyles = makeStyles((theme) => ({
   container: {
      position: "relative",
      height: "20vh",
      width: 300,
   },
   content: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      textAlign: "center",
   },
   text: {
      marginTop: 10,
   },
}));

function LoadingModal({ agoraRtcStatus }) {
   const [connectingTimeout, setConnectingTimeout] = useState(false);
   const [timeoutNumber, setTimeoutNumber] = useState(null);

   useEffect(() => {
      if (timeoutNumber) {
         clearTimeout(timeoutNumber);
      }
      if (agoraRtcStatus.msg === "RTC_JOINING_CHANNEL") {
         let number = setTimeout(() => {
            setConnectingTimeout(true);
         }, 15000);
         setTimeoutNumber(number);
      }
   }, [agoraRtcStatus]);

   const classes = useStyles();

   const LOADING_AGORA_STATI = [
      "RTC_INITIAL",
      "RTC_INITIALIZING",
      "RTC_JOINING_CHANNEL",
      "RTC_JOINED_CHANNEL",
      "RTC_REQUEST_MEDIA_ACCESS",
      "RTC_PUBLISH_STREAM",
      "RTM_DISCONNECTED",
      "RTM_RECONNECTING",
   ];

   return (
      <Dialog
         open={
            agoraRtcStatus &&
            agoraRtcStatus.type === "INFO" &&
            LOADING_AGORA_STATI.includes(agoraRtcStatus.msg)
         }
      >
         <DialogContent>
            <div className={classes.container}>
               <div className={classes.content}>
                  <CircularProgress />
                  {!connectingTimeout && (
                     <div className={classes.text}>{"Connecting..."}</div>
                  )}
                  {connectingTimeout && (
                     <div className={classes.text}>
                        {
                           "Connection seems to be blocked, attempting to connect via cloud proxy..."
                        }
                     </div>
                  )}
               </div>
            </div>
         </DialogContent>
      </Dialog>
   );
}

export default LoadingModal;
