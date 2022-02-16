import React, { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import RootState from "store/reducers";
import { ConnectionState } from "agora-rtc-sdk-ng";
import ConnectionStateModal from "./ModalViews/ConnectionStateModal";
import DebugModal from "./ModalViews/DebugModal";
import UidConflict from "./ModalViews/UidConflict";
import { rtcMessages } from "types";
import { AlertProps } from "@mui/material/Alert/Alert";
import { OptionCardProps } from "./common/OptionCard";
import { useRouter } from "next/router";

interface Props {}

const AgoraStateHandler: FC<Props> = () => {
   const dispatch = useDispatch();
   const router = useRouter();

   const [view, setView] = useState(null);
   const agoraRtcConnectionStatus = useSelector((state: RootState) => {
      return state.stream.agoraState.rtcConnectionState;
   });
   const agoraRtcError = useSelector((state: RootState) => {
      return state.stream.agoraState.rtcError;
   });

   const [steps] = useState<OptionCardProps[]>([
      {
         title: "Change Network",
         description:
            "Try disconnecting from any VPN, switching to another " +
            "network or use a mobile hotspot.",
         actionButtonProps: {
            onClick: router.reload,
            children: "Click here to refresh once done ",
            sx: { mt: 1, mx: "auto" },
         },
      },
   ]);

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
                  showConnectionStateModal();
               }
               break;
            case "CONNECTING":
               showConnectionStateModal();
               break;
            case "DISCONNECTED":
               if (prevState === "CONNECTING") return;
               if (reason === "UID_BANNED") {
                  return showUidConflictModal();
               }
               showConnectionStateModal();
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
               showDebugModal();
               break;
            case "FAILED_TO_SUBSCRIBE_WITHOUT_PROXY":
               showDebugModal();
               break;
            case "UID_CONFLICT":
               showUidConflictModal();
               break;
            default:
               return null;
         }
      })();
   }, [agoraRtcError?.code]);

   const sendRTCSateToast = (
      rtcStatus: ConnectionState,
      variant: AlertProps["severity"],
      persist?: boolean
   ) => {
      dispatch(
         actions.enqueueSnackbar({
            message: rtcMessages[rtcStatus],
            options: {
               variant: variant,
               preventDuplicate: true,
               key: rtcStatus,
               persist: Boolean(persist),
            },
         })
      );
   };

   const showConnectionStateModal = () =>
      setView(() => <ConnectionStateModal steps={steps} />);
   const showDebugModal = () => setView(() => <DebugModal steps={steps} />);
   const showUidConflictModal = () => setView(() => <UidConflict />);

   const sendConnectedToast = () => sendRTCSateToast("CONNECTED", "success");
   const sendConnectingToast = () => sendRTCSateToast("CONNECTING", "info");
   const sendReconnectingToast = () =>
      sendRTCSateToast("RECONNECTING", "warning", true);

   const closeToast = (key: ConnectionState) => {
      dispatch(actions.closeSnackbar(key));
   };

   return view || null;
};

export default AgoraStateHandler;
