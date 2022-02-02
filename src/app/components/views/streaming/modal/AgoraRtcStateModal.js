import { CircularProgress, Dialog, DialogContent } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useEffect } from "react";
import {
   AGORA_RTC_CONNECTION_STATE_CONNECTED,
   AGORA_RTC_CONNECTION_STATE_CONNECTING,
   AGORA_RTC_CONNECTION_STATE_RECONNECTING,
   AGORA_RTC_CONNECTION_STATE_DISCONNECTING,
   AGORA_RTC_CONNECTION_STATE_DISCONNECTED,
} from "constants/agora";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

const useStyles = makeStyles((theme) => ({
   container: {
      position: "relative",
      minWidth: 300,
      padding: 50,
   },
   content: {
      textAlign: "center",
      margin: 15,
      fontSize: "1.1rem",
   },
   text: {
      marginTop: 15,
   },
   icon: {
      color: "red",
      fontSize: 40,
   },
   progress: {
      width: "100%",
      textAlign: "center",
   },
}));

const messages = {
   DISCONNECTED: "Disconnected",
   RECONNECTING:
      "It seems like the connection got interrupted. Attempting to reconnect...",
   // CONNECTED: "Disconnecting...",
   CONNECTING: "Connecting...",
   CONNECTED: "Connected",
};

const AgoraRtcStateModal = () => {
   const classes = useStyles();
   const dispatch = useDispatch();

   const agoraRtcConnectionStatus = useSelector((state) => {
      return state.stream.agoraState.rtcConnectionState;
   });

   const agoraRtcError = useSelector((state) => {
      return state.stream.agoraState.rtcError;
   });

   useEffect(() => {
      if (agoraRtcConnectionStatus === AGORA_RTC_CONNECTION_STATE_CONNECTED) {
         dispatch(
            actions.enqueueSnackbar({
               message: "Connected",
               options: {
                  variant: "success",
                  preventDuplicate: true,
               },
            })
         );
      }
   }, [agoraRtcConnectionStatus]);

   return (
      <Dialog
         open={
            agoraRtcConnectionStatus !== AGORA_RTC_CONNECTION_STATE_CONNECTED &&
            !agoraRtcError
         }
      >
         <DialogContent>
            <div className={classes.container}>
               <div className={classes.progress}>
                  {(agoraRtcConnectionStatus ===
                     AGORA_RTC_CONNECTION_STATE_CONNECTING ||
                     agoraRtcConnectionStatus ===
                        AGORA_RTC_CONNECTION_STATE_RECONNECTING ||
                     agoraRtcConnectionStatus ===
                        AGORA_RTC_CONNECTION_STATE_DISCONNECTING) && (
                     <CircularProgress />
                  )}
                  {agoraRtcConnectionStatus ===
                     AGORA_RTC_CONNECTION_STATE_DISCONNECTED && (
                     <HighlightOffIcon className={classes.icon} />
                  )}
               </div>
               <div className={classes.content}>
                  {messages[agoraRtcConnectionStatus]}
               </div>
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default AgoraRtcStateModal;
