import { Box, CircularProgress, Dialog, DialogContent } from "@mui/material";
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
import RootState from "../../../../store/reducers";
import { ConnectionState } from "agora-rtc-sdk-ng";

const styles = {
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
} as const;

type Messages = {
   [key in ConnectionState]?: string;
};

const messages: Messages = {
   DISCONNECTED: "Disconnected",
   RECONNECTING:
      "It seems like the connection got interrupted. Attempting to reconnect...",
   CONNECTING: "Connecting...",
   CONNECTED: "Connected",
};

const AgoraRtcStateModal = () => {
   const dispatch = useDispatch();

   const agoraRtcConnectionStatus = useSelector((state: RootState) => {
      return state.stream.agoraState.rtcConnectionState;
   });

   const agoraRtcError = useSelector((state: RootState) => {
      return state.stream.agoraState.rtcError;
   });

   useEffect(() => {
      if (agoraRtcConnectionStatus === "CONNECTED") {
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
      <Dialog open={agoraRtcConnectionStatus !== "CONNECTED" && !agoraRtcError}>
         <DialogContent>
            <Box sx={styles.container}>
               <Box sx={styles.progress}>
                  {(agoraRtcConnectionStatus === "CONNECTING" ||
                     agoraRtcConnectionStatus === "RECONNECTING" ||
                     agoraRtcConnectionStatus === "DISCONNECTING") && (
                     <CircularProgress />
                  )}
                  {agoraRtcConnectionStatus === "DISCONNECTED" && (
                     <HighlightOffIcon sx={styles.icon} />
                  )}
               </Box>
               <Box sx={styles.content}>
                  {messages[agoraRtcConnectionStatus]}
               </Box>
            </Box>
         </DialogContent>
      </Dialog>
   );
};

export default AgoraRtcStateModal;
