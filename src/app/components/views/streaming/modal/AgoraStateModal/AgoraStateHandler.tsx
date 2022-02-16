import React, { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import RootState from "store/reducers";
import { ConnectionState } from "agora-rtc-sdk-ng";
import ConnectionStateModal from "./ModalViews/ConnectionStateModal";
import FailedToSubscribeWithProxy from "./ModalViews/FailedToSubscribeWithProxy";
import FailedToSubscribeWithoutProxy from "./ModalViews/FailedToSubscribeWithoutProxy";
import UidConflict from "./ModalViews/UidConflict";
import { rtcMessages } from "../../../../../types";
import { AlertProps } from "@mui/material/Alert/Alert";

interface Props {
   handleEnableCloudProxy: () => Promise<void>;
   isViewer?: boolean
}

const AgoraStateHandler: FC<Props> = ({ handleEnableCloudProxy, isViewer }) => {
   const dispatch = useDispatch();
   const [view, setView] = useState(null);
   const agoraRtcConnectionStatus = useSelector((state: RootState) => {
      return state.stream.agoraState.rtcConnectionState;
   });
   const agoraRtcError = useSelector((state: RootState) => {
      return state.stream.agoraState.rtcError;
   });

   useEffect(() => {
      (function handleStatus() {
         console.log("-> agoraRtcConnectionStatus", agoraRtcConnectionStatus);
         const { prevState, curState, reason } = agoraRtcConnectionStatus;

         if (reason === "LEAVE") return;
         switch (curState) {
            case "CONNECTED":
               closeToast(prevState);
               sendConnectedToast();
               setView(null);
               break;
            case "RECONNECTING":
               if (prevState === "CONNECTED") {
                  if(isViewer){
                     sendReconnectingToast()
                  } else {
                  setView(() => (
                     <ConnectionStateModal
                     />
                  ));

                  }
               }
               break;
            case "CONNECTING":
               if(isViewer){
                  sendConnectingToast()
               } else {
               setView(() => (
                  <ConnectionStateModal
                  />
               ));
               }
               break;
            case "DISCONNECTED":
               if (prevState === "CONNECTING") return;
               if (reason === "UID_BANNED") {
                  return setView(() => <UidConflict />);
               }
               setView(() => (
                  <ConnectionStateModal
                  />
               ));
               break;
            case "DISCONNECTING":
               setView(null);
               break;
            default:
               setView(null);
               break;
         }

         return () => {
            closeToast(curState);
            setView(null);
         };
      })();
   }, [agoraRtcConnectionStatus]);

   useEffect(() => {
      (function handleError() {
         switch (agoraRtcError?.code) {
            case "FAILED_TO_SUBSCRIBE_WITH_PROXY":
               setView(() => (
                  <FailedToSubscribeWithProxy
                     handleEnableProxy={handleEnableCloudProxy}
                  />
               ));
               break;
            case "FAILED_TO_SUBSCRIBE_WITHOUT_PROXY":
               setView(() => (
                  <FailedToSubscribeWithoutProxy
                     handleEnableProxy={handleEnableCloudProxy}
                  />
               ));
               break;
            case "UID_CONFLICT":
               setView(() => <UidConflict />);
               break;
            default:
               return null;
         }
      })();
   }, [agoraRtcError?.code]);

   const sendRTCSateToast = (rtcStatus: ConnectionState, variant:AlertProps['severity'], persist?:boolean ) => {
      dispatch(
         actions.enqueueSnackbar({
            message: rtcMessages[rtcStatus],
            options: {
               variant: variant,
               preventDuplicate: true,
               key: rtcStatus,
               persist: Boolean(persist)
            },
         })
      );
   };

   const sendConnectedToast = () =>sendRTCSateToast("CONNECTED", "success")
   const sendConnectingToast = () =>sendRTCSateToast("CONNECTING", "info")
   const sendReconnectingToast = () =>sendRTCSateToast("RECONNECTING", "warning", true)

   const closeToast = (key: ConnectionState) => {
      dispatch(actions.closeSnackbar(key));
   };

   return view || null;
};

export default AgoraStateHandler;
