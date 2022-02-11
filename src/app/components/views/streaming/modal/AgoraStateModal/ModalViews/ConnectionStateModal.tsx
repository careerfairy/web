import React, { FC, useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import {
   Box,
   CircularProgress,
   Collapse,
   Stack,
   Typography,
} from "@mui/material";
import * as actions from "store/actions";

import { ConnectionState } from "agora-rtc-sdk-ng";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import LoadingButton from "@mui/lab/LoadingButton";
import { useDispatch, useSelector } from "react-redux";
import RootState from "store/reducers";

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
interface Props {
   handleEnableCloudProxy: () => Promise<void>;
}
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
const loadingTimeLimit = 10000;
const ConnectionStateModal: FC<Props> = ({ handleEnableCloudProxy }) => {
   const dispatch = useDispatch();
   const [enablingCompatMode, setEnablingCompatMode] = useState(false);
   const [showEnableProxyPrompt, setShowEnableProxyPrompt] = useState(false);
   const agoraRtcConnectionStatus = useSelector((state: RootState) => {
      return state.stream.agoraState.rtcConnectionState;
   });

   const sessionIsUsingCloudProxy = useSelector((state: RootState) => {
      return state.stream.agoraState.sessionIsUsingCloudProxy;
   });

   useEffect(() => {
      (function handlePromptUseCloudProxy() {
         const { curState } = agoraRtcConnectionStatus;
         let timeout;
         const inALoadingState = [
            "CONNECTING",
            "RECONNECTING",
            "DISCONNECTED",
         ].includes(curState);
         if (inALoadingState && !sessionIsUsingCloudProxy) {
            timeout = setTimeout(async () => {
               setShowEnableProxyPrompt(true);
            }, loadingTimeLimit);
         } else {
            setShowEnableProxyPrompt(false);
            if (timeout) {
               clearTimeout(timeout);
            }
         }

         return () => clearTimeout(timeout);
      })();
   }, [agoraRtcConnectionStatus, sessionIsUsingCloudProxy]);

   const handleEnableCompat = async () => {
      try {
         setEnablingCompatMode(true);
         await handleEnableCloudProxy();
      } catch (e) {
         dispatch(actions.sendGeneralError(e));
      }
      setEnablingCompatMode(false);
   };

   return (
      <Dialog open={true}>
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
               <Box sx={styles.content}>
                  {messages[agoraRtcConnectionStatus.curState]}
               </Box>
               <Collapse in={showEnableProxyPrompt}>
                  <Stack spacing={1}>
                     <Typography>
                        This is taking a little longer than usual
                     </Typography>
                     <LoadingButton
                        onClick={handleEnableCompat}
                        variant="contained"
                        color="primary"
                        loading={enablingCompatMode}
                     >
                        {enablingCompatMode
                           ? "Enabling Compatability Mode"
                           : "Try compatability mode"}
                     </LoadingButton>
                  </Stack>
               </Collapse>
            </Box>
         </DialogContent>
      </Dialog>
   );
};

export default ConnectionStateModal;
