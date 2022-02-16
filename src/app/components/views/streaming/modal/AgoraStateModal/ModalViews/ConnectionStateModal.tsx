import React, { FC, useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { Box, CircularProgress, Collapse, Stack, Typography } from "@mui/material";
import * as actions from "store/actions";
import { RTC_CLIENT_JOIN_TIME_LIMIT } from "constants/streams";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import LoadingButton from "@mui/lab/LoadingButton";
import { useDispatch, useSelector } from "react-redux";
import RootState from "store/reducers";
import { rtcMessages } from "../../../../../../types";

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
}



const loadingTimeLimit = RTC_CLIENT_JOIN_TIME_LIMIT + 3000;
const ConnectionStateModal: FC<Props> = ( ) => {
   const [showDebugPrompt, setShowDebugPrompt] = useState(false);
   const agoraRtcConnectionStatus = useSelector((state: RootState) => {
      return state.stream.agoraState.rtcConnectionState;
   });

   const sessionIsUsingCloudProxy = useSelector((state: RootState) => {
      return state.stream.agoraState.sessionIsUsingCloudProxy;
   });

   useEffect(() => {
      (function handlePromptUseDebug() {
         const { curState } = agoraRtcConnectionStatus;
         let timeout;
         const inALoadingState = [
            "CONNECTING",
            "RECONNECTING",
            "DISCONNECTED",
         ].includes(curState);
         if (inALoadingState) {
            timeout = setTimeout(async () => {
               setShowDebugPrompt(true);
            }, loadingTimeLimit);
         } else {
            setShowDebugPrompt(false);
            if (timeout) {
               clearTimeout(timeout);
            }
         }

         return () => clearTimeout(timeout);
      })();
   }, [agoraRtcConnectionStatus, sessionIsUsingCloudProxy]);

   const handleEnableCompat = async () => {
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
                  {rtcMessages[agoraRtcConnectionStatus.curState]}
               </Box>
               {/*<Collapse in={showDebugPrompt}>*/}
               {/*   <Stack spacing={1}>*/}
               {/*      <Typography>*/}
               {/*         This is taking a little longer than usual*/}
               {/*      </Typography>*/}
               {/*      <LoadingButton*/}
               {/*         onClick={handleEnableCompat}*/}
               {/*         variant="contained"*/}
               {/*         color="primary"*/}
               {/*      >*/}
               {/*            Try compatability mode*/}
               {/*      </LoadingButton>*/}
               {/*   </Stack>*/}
               {/*</Collapse>*/}
            </Box>
         </DialogContent>
      </Dialog>
   );
};

export default ConnectionStateModal;
