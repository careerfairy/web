import React, { FC, useEffect, useMemo } from "react";
import { alpha } from "@mui/material/styles";
import SignalWifi0BarRoundedIcon from "@mui/icons-material/SignalWifi0BarRounded";
import SignalWifi1BarRoundedIcon from "@mui/icons-material/SignalWifi1BarRounded";
import SignalWifi2BarRoundedIcon from "@mui/icons-material/SignalWifi2BarRounded";
import SignalWifi3BarRoundedIcon from "@mui/icons-material/SignalWifi3BarRounded";
import SignalWifi4BarRoundedIcon from "@mui/icons-material/SignalWifi4BarRounded";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CachedIcon from "@mui/icons-material/Cached";
import WarningIcon from "@mui/icons-material/Warning";
import { ArrowDown, ArrowUp } from "react-feather";
import clsx from "clsx";
import { Box, Tooltip } from "@mui/material";
import * as actions from "store/actions";
import { useDispatch, useSelector } from "react-redux";
import InternetIcon from "@mui/icons-material/Wifi";
import ServerIcon from "@mui/icons-material/CheckCircleOutline";
import RootState from "../../../../store/reducers";
import { ConnectionState, NetworkQuality } from "agora-rtc-sdk-ng";

const gradient = [
   "rgba(0,0,0,0.5)",
   "#54db00",
   "#aeca45",
   "#ca9f00",
   "#df6a00",
   "#e72e00",
   "#e70026",
];

const styles = {
   root: {
      fontSize: "0.8rem",
      cursor: "move",
      borderRadius: 10,
      padding: (theme) => theme.spacing(1),
      boxShadow: (theme) => theme.shadows[2],
      backgroundColor: (theme) => alpha(theme.palette.common.black, 0.4),
      backdropFilter: "blur(5px)",
      transition: (theme) =>
         theme.transitions.create("transform", {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
         }),
      "&:hover": {
         transform: `scale(1.05)`,
      },
   },
   subBox: {
      display: "flex",
   },
   svgShadow: {
      filter: `drop-shadow(0px 0px 2px rgba(0,0,0,0.4))`,
   },
   arrowUplinkIcon: {
      width: (theme) => theme.spacing(2),
   },
   arrowDownlinkIcon: {
      width: (theme) => theme.spacing(2),
   },
   svg: {
      fontSize: "1.9em",
   },
   text: {
      color: (theme) => theme.palette.common.white,
   },
} as const;

interface WifiIndicatorProps {
   uplink: NetworkQuality["uplinkNetworkQuality"];
   downlink: NetworkQuality["downlinkNetworkQuality"];
}

const WifiIndicator: FC<WifiIndicatorProps> = ({
   uplink,
   downlink,
   ...rest
}) => {
   const agoraRtcConnectionStatus = useSelector((state: RootState) => {
      return state.stream.agoraState.rtcConnectionState;
   });
   const dispatch = useDispatch();

   useEffect(() => {
      return () => {
         let connectionStati = [
            "DisconnectedStatus",
            "ConnectingStatus",
            "ConnectedStatus",
         ];
         connectionStati.forEach((status) => {
            dispatch(actions.closeSnackbar(status));
         });
      };
   }, []);

   const getNetWorkInfo = (isUplink?: boolean) => {
      let newStyles = isUplink
         ? {
              color: gradient[uplink],
           }
         : {
              color: gradient[downlink],
           };
      newStyles = {
         ...newStyles,
         ...styles.svgShadow,
         ...styles.svg,
      };
      return [
         {
            rating: 0,
            description: `The ${
               isUplink ? "upload" : "download"
            } network quality is unknown.`,
            icon: <SignalWifi0BarRoundedIcon sx={newStyles} />,
            color: gradient[0],
         },
         {
            rating: 1,
            description: `The ${
               isUplink ? "upload" : "download"
            } network quality is excellent.`,
            icon: <SignalWifi4BarRoundedIcon sx={newStyles} />,
            color: gradient[1],
         },
         {
            rating: 2,
            description: `The ${
               isUplink ? "upload" : "download"
            } network quality is good, but the bitrate may be slightly lower than optimal.`,
            icon: <SignalWifi3BarRoundedIcon sx={newStyles} />,
            color: gradient[2],
         },
         {
            rating: 3,
            description: `Users experience slightly impaired communication with this ${
               isUplink ? "upload" : "download"
            } quality.`,
            icon: <SignalWifi3BarRoundedIcon sx={newStyles} />,
            color: gradient[3],
         },
         {
            rating: 4,
            description: `Users cannot communicate smoothly with this ${
               isUplink ? "upload" : "download"
            } quality.`,
            icon: <SignalWifi2BarRoundedIcon sx={newStyles} />,
            color: gradient[4],
         },
         {
            rating: 5,
            description: `The ${
               isUplink ? "upload" : "download"
            } network quality is so poor that users can barely communicate.`,
            icon: <SignalWifi2BarRoundedIcon sx={newStyles} />,
            color: gradient[5],
         },
         {
            rating: 6,
            description: `The ${
               isUplink ? "upload" : "download"
            } network quality is down and users cannot communicate at all.`,
            icon: <SignalWifi1BarRoundedIcon sx={newStyles} />,
            color: gradient[6],
         },
      ];
   };

   const getRtmConnectionInfo = (curState: ConnectionState) => {
      switch (curState) {
         case "CONNECTED":
            return {
               icon: (
                  <InternetIcon sx={styles.svg} style={{ color: "#00F92C" }} />
               ),
               message: "You are connected to the internet",
            };
         case "RECONNECTING":
            return {
               icon: (
                  <WarningIcon sx={styles.svg} style={{ color: "#FFEF00" }} />
               ),
               message: "Attempting to connect to the internet...",
            };
         case "DISCONNECTED":
            return {
               icon: (
                  <ErrorOutlineIcon
                     sx={styles.svg}
                     style={{ color: "#FF3200" }}
                  />
               ),
               message: "You are disconnected from the internet",
            };
         default:
            return {
               icon: <CachedIcon sx={styles.svg} />,
               message: "Waiting for connection status...",
            };
      }
   };

   const getRtcConnectionInfo = (status) => {
      switch (status) {
         case "CONNECTED":
            return {
               icon: (
                  <ServerIcon sx={styles.svg} style={{ color: "#00F92C" }} />
               ),
               message: "You are connected to our streaming server",
            };
         case "CONNECTING":
            return {
               icon: (
                  <WarningIcon sx={styles.svg} style={{ color: "#FFEF00" }} />
               ),
               message: "Attempting to connect to our streaming server...",
            };
         case "DISCONNECTED":
            return {
               icon: (
                  <ErrorOutlineIcon
                     sx={styles.svg}
                     style={{ color: "#FF3200" }}
                  />
               ),
               message: "You are disconnected from our streaming server",
            };
         default:
            return {
               icon: <CachedIcon sx={styles.svg} />,
               message: "Waiting for connection status...",
            };
      }
   };

   const uplinkInfo = useMemo(() => getNetWorkInfo(true)[uplink], [uplink]);
   const downlinkInfo = useMemo(() => getNetWorkInfo()[downlink], [downlink]);

   const rtmConnectionInfo = useMemo(
      () => getRtmConnectionInfo(agoraRtcConnectionStatus.curState),
      [agoraRtcConnectionStatus.curState]
   );
   const rtcConnectionInfo = useMemo(
      () => getRtcConnectionInfo(agoraRtcConnectionStatus?.curState),
      [agoraRtcConnectionStatus?.curState]
   );

   return (
      <Box {...rest} sx={styles.root}>
         <Box>
            <Tooltip title={rtmConnectionInfo.message}>
               <Box
                  marginRight={1}
                  marginBottom={1}
                  alignItems="left"
                  sx={styles.subBox}
               >
                  <Box display="flex" marginRight={1}>
                     {rtmConnectionInfo.icon}
                  </Box>
                  <Box display="flex" sx={styles.text}>
                     Internet
                  </Box>
               </Box>
            </Tooltip>
            <Tooltip title={rtcConnectionInfo.message}>
               <Box
                  marginRight={1}
                  marginBottom={1}
                  alignItems="left"
                  sx={styles.subBox}
               >
                  <Box display="flex" marginRight={1}>
                     {rtcConnectionInfo.icon}
                  </Box>
                  <Box display="flex" sx={styles.text}>
                     Streaming
                  </Box>
               </Box>
            </Tooltip>
         </Box>
         <Box sx={styles.subBox}>
            <Tooltip
               style={{ color: uplinkInfo.color }}
               placement="top"
               title={uplinkInfo.description}
            >
               <Box marginRight={1} alignItems="center" display="flex">
                  {uplinkInfo.icon}
                  <Box
                     component={ArrowUp}
                     sx={[
                        styles.arrowUplinkIcon,
                        styles.svgShadow,
                        { color: gradient[uplink] },
                     ]}
                  />
               </Box>
            </Tooltip>
            <Tooltip
               style={{ color: downlinkInfo.color }}
               placement="top"
               title={downlinkInfo.description}
            >
               <Box alignItems="center" display="flex">
                  {downlinkInfo.icon}
                  <Box
                     component={ArrowDown}
                     sx={[
                        styles.arrowDownlinkIcon,
                        styles.svgShadow,
                        { color: gradient[downlink] },
                     ]}
                  />
               </Box>
            </Tooltip>
         </Box>
      </Box>
   );
};

export default WifiIndicator;
