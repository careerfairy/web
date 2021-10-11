import React, { useEffect, useMemo } from "react";
import { alpha, makeStyles } from "@material-ui/core/styles";
import SignalWifi0BarRoundedIcon from "@material-ui/icons/SignalWifi0BarRounded";
import SignalWifi1BarRoundedIcon from "@material-ui/icons/SignalWifi1BarRounded";
import SignalWifi2BarRoundedIcon from "@material-ui/icons/SignalWifi2BarRounded";
import SignalWifi3BarRoundedIcon from "@material-ui/icons/SignalWifi3BarRounded";
import SignalWifi4BarRoundedIcon from "@material-ui/icons/SignalWifi4BarRounded";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import CachedIcon from "@material-ui/icons/Cached";
import WarningIcon from "@material-ui/icons/Warning";
import { ArrowDown, ArrowUp } from "react-feather";
import PropTypes from "prop-types";
import clsx from "clsx";
import { Box, Tooltip } from "@material-ui/core";
import * as actions from "store/actions";
import { useDispatch } from "react-redux";
import InternetIcon from '@material-ui/icons/Wifi';
import ServerIcon from "@material-ui/icons/CheckCircleOutline"
const gradient = [
   "rgba(0,0,0,0.5)",
   "#54db00",
   "#aeca45",
   "#ca9f00",
   "#df6a00",
   "#e72e00",
   "#e70026",
];

const useStyles = makeStyles((theme) => ({
   root: {
      fontSize: "0.8rem",
      cursor: "move",
      borderRadius: 10,
      padding: theme.spacing(1),
      boxShadow: theme.shadows[2],
      backgroundColor: alpha(theme.palette.common.black, 0.4),
      backdropFilter: "blur(5px)",
      transition: theme.transitions.create("transform", {
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
   uplinkWifiIcon: {
      color: ({ uplinkIndex }) => gradient[uplinkIndex],
   },
   svgShadow: {
      filter: `drop-shadow(0px 0px 2px rgba(0,0,0,0.4))`,
   },
   downlinkWifiIcon: {
      color: ({ downlinkIndex }) => gradient[downlinkIndex],
   },
   arrowUplinkIcon: {
      color: ({ uplinkIndex }) => gradient[uplinkIndex],
      width: theme.spacing(2),
   },
   arrowDownlinkIcon: {
      color: ({ downlinkIndex }) => gradient[downlinkIndex],
      width: theme.spacing(2),
   },
   svg:{
      fontSize: "1.9em",
   },
   text: {
      color: theme.palette.common.white,
   },
}));

const WifiIndicator = ({
   isDownLink,
   uplink,
   agoraRtcConnectionStatus,
   agoraRtmStatus,
   downlink,
   className,
   ...rest
}) => {
   const dispatch = useDispatch();
   useEffect(() => {
      if (agoraRtcConnectionStatus.curState === "CONNECTING") {
         enqueueSnackbar("Connecting...", "ConnectingStatus", "warning", true);
         return () => dispatch(actions.closeSnackbar("ConnectingStatus"));
      }
      if (agoraRtcConnectionStatus.curState === "CONNECTED") {
         enqueueSnackbar("Connected!", "ConnectedStatus", "success", false);
         return () => dispatch(actions.closeSnackbar("ConnectedStatus"));
      }
      if (
         agoraRtcConnectionStatus.prevState === "CONNECTED" &&
         agoraRtcConnectionStatus.curState === "DISCONNECTED"
      ) {
         enqueueSnackbar(
            "Disconnected. Check your connection...",
            "DisconnectedStatus",
            "error",
            true
         );
         return () => dispatch(actions.closeSnackbar("DisconnectedStatus"));
      }
   }, [agoraRtcConnectionStatus]);

   const enqueueSnackbar = (message, key, variant, persist) => {
      dispatch(
         actions.enqueueSnackbar({
            message: message,
            options: {
               variant: variant,
               key: key,
               preventDuplicate: true,
               persist: persist,
            },
         })
      );
   };

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

   const classes = useStyles({
      uplinkIndex: uplink,
      downlinkIndex: downlink,
   });

   const getNetWorkInfo = (isUplink) => {
      let newClasses = isUplink
         ? classes.uplinkWifiIcon
         : classes.downlinkWifiIcon;
      newClasses = clsx(newClasses, classes.svgShadow, classes.svg);
      return [
         {
            rating: 0,
            description: `The ${
               isUplink ? "upload" : "download"
            } network quality is unknown.`,
            icon: <SignalWifi0BarRoundedIcon className={newClasses} />,
            color: gradient[0],
         },
         {
            rating: 1,
            description: `The ${
               isUplink ? "upload" : "download"
            } network quality is excellent.`,
            icon: <SignalWifi4BarRoundedIcon className={newClasses} />,
            color: gradient[1],
         },
         {
            rating: 2,
            description: `The ${
               isUplink ? "upload" : "download"
            } network quality is good, but the bitrate may be slightly lower than optimal.`,
            icon: <SignalWifi3BarRoundedIcon className={newClasses} />,
            color: gradient[2],
         },
         {
            rating: 3,
            description: `Users experience slightly impaired communication with this ${
               isUplink ? "upload" : "download"
            } quality.`,
            icon: <SignalWifi3BarRoundedIcon className={newClasses} />,
            color: gradient[3],
         },
         {
            rating: 4,
            description: `Users cannot communicate smoothly with this ${
               isUplink ? "upload" : "download"
            } quality.`,
            icon: <SignalWifi2BarRoundedIcon className={newClasses} />,
            color: gradient[4],
         },
         {
            rating: 5,
            description: `The ${
               isUplink ? "upload" : "download"
            } network quality is so poor that users can barely communicate.`,
            icon: <SignalWifi2BarRoundedIcon className={newClasses} />,
            color: gradient[5],
         },
         {
            rating: 6,
            description: `The ${
               isUplink ? "upload" : "download"
            } network quality is down and users cannot communicate at all.`,
            icon: <SignalWifi1BarRoundedIcon className={newClasses} />,
            color: gradient[6],
         },
      ];
   };

   const getRtmConnectionInfo = (status) => {
      switch (status) {
         case "RTM_CONNECTED":
            return {
               icon: <InternetIcon  className={classes.svg} style={{ color: "#00F92C" }} />,
               message: "You are connected to the internet",
            };
         case "RTM_NETWORK_INTERRUPTED":
            return {
               icon: <WarningIcon  className={classes.svg} style={{ color: "#FFEF00" }} />,
               message: "Attempting to connect to the internet...",
            };
         case "RTM_DISCONNECTED":
            return {
               icon: <ErrorOutlineIcon  className={classes.svg} style={{ color: "#FF3200" }} />,
               message: "You are disconnected from the internet",
            };
         default:
            return {
               icon: <CachedIcon  className={classes.svg} />,
               message: "Waiting for connection status...",
            };
      }
   };

   const getRtcConnectionInfo = (status) => {
      switch (status) {
         case "CONNECTED":
            return {
               icon: <ServerIcon className={classes.svg} style={{ color: "#00F92C" }} />,
               message: "You are connected to our streaming server",
            };
         case "CONNECTING":
            return {
               icon: <WarningIcon className={classes.svg} style={{ color: "#FFEF00" }} />,
               message: "Attempting to connect to our streaming server...",
            };
         case "DISCONNECTED":
            return {
               icon: <ErrorOutlineIcon className={classes.svg} style={{ color: "#FF3200" }} />,
               message: "You are disconnected from our streaming server",
            };
         default:
            return {
               icon: <CachedIcon className={classes.svg} />,
               message: "Waiting for connection status...",
            };
      }
   };

   const uplinkInfo = useMemo(() => getNetWorkInfo(true)[uplink], [uplink]);
   const downlinkInfo = useMemo(() => getNetWorkInfo()[downlink], [downlink]);

   const rtmConnectionInfo = useMemo(
      () => getRtmConnectionInfo(agoraRtmStatus.msg),
      [agoraRtmStatus.msg]
   );
   const rtcConnectionInfo = useMemo(
      () => getRtcConnectionInfo(agoraRtcConnectionStatus.curState),
      [agoraRtcConnectionStatus.curState]
   );

   return  (
        <Box  {...rest} className={clsx(classes.root, className)}>
           <Box>
              <Tooltip title={rtmConnectionInfo.message}>
                 <Box
                   marginRight={1}
                   marginBottom={1}
                   alignItems="left"
                   className={classes.subBox}
                 >
                    <Box display="flex" marginRight={1}>
                       {rtmConnectionInfo.icon}
                    </Box>
                    <Box display="flex" className={classes.text}>
                       Internet
                    </Box>
                 </Box>
              </Tooltip>
              <Tooltip title={rtcConnectionInfo.message}>
                 <Box
                   marginRight={1}
                   marginBottom={1}
                   alignItems="left"
                   className={classes.subBox}
                 >
                    <Box display="flex" marginRight={1}>
                       {rtcConnectionInfo.icon}
                    </Box>
                    <Box display="flex" className={classes.text}>
                       Streaming
                    </Box>
                 </Box>
              </Tooltip>
           </Box>
           <Box className={classes.subBox}>
              <Tooltip
                style={{ color: uplinkInfo.color }}
                placement="top"
                title={uplinkInfo.description}
              >
                 <Box marginRight={1} alignItems="center" display="flex">
                    {uplinkInfo.icon}
                    <ArrowUp
                      className={clsx(
                        classes.arrowUplinkIcon,
                        classes.svgShadow
                      )}
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
                    <ArrowDown
                      className={clsx(
                        classes.arrowDownlinkIcon,
                        classes.svgShadow
                      )}
                    />
                 </Box>
              </Tooltip>
           </Box>
        </Box>
   );

};

WifiIndicator.propTypes = {
   downlink: PropTypes.number,
   uplink: PropTypes.number,
   className: PropTypes.string,
};

export default WifiIndicator;
