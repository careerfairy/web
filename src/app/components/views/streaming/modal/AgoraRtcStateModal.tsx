import { Box, CircularProgress, Dialog, DialogContent } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import RootState from "store/reducers";
import { ConnectionState } from "agora-rtc-sdk-ng";

const styles = {
   container: {
      position: "relative",
      minWidth: 300,
      padding: 6,
   },
   content: {
      textAlign: "center",
      margin: 2,
      fontSize: "1.1rem",
   },
   text: {
      marginTop: 2,
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
   DISCONNECTING: "",
};

const AgoraRtcStateModal = () => {
   const dispatch = useDispatch();
   const [open, setOpen] = useState(false);
   const [message, setMessage] = useState<string>(null);
   const agoraRtcConnectionStatus = useSelector((state: RootState) => {
      return state.stream.agoraState.rtcConnectionState;
   });

   const agoraRtcError = useSelector((state: RootState) => {
      return state.stream.agoraState.rtcError;
   });
   useEffect(() => {
      (function handleStatus() {
         const { prevState, curState, reason } = agoraRtcConnectionStatus;
         console.log("-> curState", curState);
         if (reason === "LEAVE") return;
         switch (curState) {
            case "CONNECTED":
               sendConnectedToast();
               closeRtcStateModal();
               break;
            case "RECONNECTING":
               openRtcStateModal("RECONNECTING");
               break;
            case "CONNECTING":
               openRtcStateModal("CONNECTING");
               break;
            case "DISCONNECTED":
               openRtcStateModal("DISCONNECTED");
               break;
            case "DISCONNECTING":
               closeRtcStateModal();
               break;
            default:
               closeRtcStateModal();
               break;
         }
      })();
   }, [agoraRtcConnectionStatus]);

   const sendConnectedToast = () => {
      dispatch(
         actions.enqueueSnackbar({
            message: messages.CONNECTED,
            options: {
               variant: "success",
               preventDuplicate: true,
               key: messages.CONNECTED,
            },
         })
      );
   };

   const openRtcStateModal = (connectionSate: ConnectionState) => {
      if (agoraRtcError) return;
      setOpen(true);
      setMessage(messages[connectionSate]);
   };
   const closeRtcStateModal = () => {
      open && setOpen(false);
      setMessage(null);
   };

   return (
      <Dialog open={open}>
         <DialogContent dividers>
            <Box sx={styles.container}>
               <Box sx={styles.progress}>
                  {["CONNECTING", "RECONNECTING", "DISCONNECTING"].includes(
                     agoraRtcConnectionStatus.curState
                  ) && <CircularProgress />}
                  {agoraRtcConnectionStatus.curState === "DISCONNECTED" && (
                     <HighlightOffIcon sx={styles.icon} />
                  )}
               </Box>
               <Box sx={styles.content}>{message}</Box>
            </Box>
         </DialogContent>
      </Dialog>
   );
};

export default AgoraRtcStateModal;
