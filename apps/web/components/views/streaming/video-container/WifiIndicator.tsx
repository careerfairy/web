import React, { FC, useEffect, useMemo, useState } from "react"
import { alpha } from "@mui/material/styles"
import SignalWifi0BarRoundedIcon from "@mui/icons-material/SignalWifi0BarRounded"
import SignalWifi1BarRoundedIcon from "@mui/icons-material/SignalWifi1BarRounded"
import SignalWifi2BarRoundedIcon from "@mui/icons-material/SignalWifi2BarRounded"
import SignalWifi3BarRoundedIcon from "@mui/icons-material/SignalWifi3BarRounded"
import SignalWifi4BarRoundedIcon from "@mui/icons-material/SignalWifi4BarRounded"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import ProxyIcon from "@mui/icons-material/CellTower"
import CachedIcon from "@mui/icons-material/Cached"
import WarningIcon from "@mui/icons-material/Warning"
import { ArrowDown, ArrowUp } from "react-feather"
import Box from "@mui/material/Box"
import Tooltip from "@mui/material/Tooltip"
import Stack from "@mui/material/Stack"
import * as actions from "store/actions"
import { useDispatch, useSelector } from "react-redux"
import InternetIcon from "@mui/icons-material/Wifi"
import ServerIcon from "@mui/icons-material/CheckCircleOutline"
import { RootState } from "../../../../store"
import { ConnectionState, NetworkQuality } from "agora-rtc-sdk-ng"
import { rtcConnectionStateSelector } from "../../../../store/selectors/streamSelectors"

const gradient = [
   "rgba(0,0,0,0.5)",
   "#00F92C",
   "#aeca45",
   "#ca9f00",
   "#df6a00",
   "#e72e00",
   "#e70026",
]

const styles = {
   root: {
      fontSize: "0.8rem",
      cursor: "move",
      borderRadius: 2,
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
      p: 1,
   },
   subBox: {
      display: "flex",
      width: "100%",
   },
   svgShadow: {
      filter: `drop-shadow(0px 0px 2px rgba(0,0,0,0.4))`,
   },
   svg: {
      fontSize: "1.9em",
      mt: "auto",
   },
   smallSvg: {
      width: 14,
      height: 14,
   },
   text: {
      color: (theme) => theme.palette.common.white,
   },
} as const

interface WifiIndicatorProps {
   uplink: NetworkQuality["uplinkNetworkQuality"]
   downlink: NetworkQuality["downlinkNetworkQuality"]
}

const WifiIndicator: FC<WifiIndicatorProps> = ({ uplink, downlink }) => {
   const agoraRtcConnectionStatus = useSelector(rtcConnectionStateSelector)
   const proxyActive = useSelector((state: RootState) => {
      return state.stream.agoraState.sessionIsUsingCloudProxy
   })

   const [open, setOpen] = useState(false)
   const dispatch = useDispatch()

   useEffect(() => {
      return () => {
         let connectionStati = [
            "DisconnectedStatus",
            "ConnectingStatus",
            "ConnectedStatus",
         ]
         connectionStati.forEach((status) => {
            dispatch(actions.closeSnackbar(status))
         })
      }
   }, [])

   const handleOpen = () => setOpen(true)
   const handleClose = () => setOpen(false)

   const getNetWorkInfo = (isUplink?: boolean) => {
      let newStyles = isUplink
         ? {
              color: gradient[uplink],
           }
         : {
              color: gradient[downlink],
           }
      newStyles = {
         ...newStyles,
         ...styles.svgShadow,
         ...styles.svg,
      }
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
            } network quality is excellent`,
            icon: <SignalWifi4BarRoundedIcon sx={newStyles} />,
            color: gradient[1],
         },
         {
            rating: 2,
            description: `The ${
               isUplink ? "upload" : "download"
            } network quality is good, but the bitrate may be slightly lower than optimal`,
            icon: <SignalWifi3BarRoundedIcon sx={newStyles} />,
            color: gradient[2],
         },
         {
            rating: 3,
            description: `Users experience slightly impaired communication with this ${
               isUplink ? "upload" : "download"
            } quality`,
            icon: <SignalWifi3BarRoundedIcon sx={newStyles} />,
            color: gradient[3],
         },
         {
            rating: 4,
            description: `Users cannot communicate smoothly with this ${
               isUplink ? "upload" : "download"
            } quality`,
            icon: <SignalWifi2BarRoundedIcon sx={newStyles} />,
            color: gradient[4],
         },
         {
            rating: 5,
            description: `The ${
               isUplink ? "upload" : "download"
            } network quality is so poor that users can barely communicate`,
            icon: <SignalWifi2BarRoundedIcon sx={newStyles} />,
            color: gradient[5],
         },
         {
            rating: 6,
            description: `The ${
               isUplink ? "upload" : "download"
            } network quality is down and users cannot communicate at all`,
            icon: <SignalWifi1BarRoundedIcon sx={newStyles} />,
            color: gradient[6],
         },
      ]
   }

   const getRtmConnectionInfo = (curState: ConnectionState) => {
      switch (curState) {
         case "CONNECTED":
            return {
               icon: (
                  <InternetIcon
                     sx={styles.svg}
                     style={{ color: gradient[Math.max(uplink, downlink)] }}
                  />
               ),
               message: "You are connected to the internet",
            }
         case "RECONNECTING":
            return {
               icon: (
                  <WarningIcon sx={styles.svg} style={{ color: "#FFEF00" }} />
               ),
               message: "Attempting to connect to the internet...",
            }
         case "DISCONNECTED":
            return {
               icon: (
                  <ErrorOutlineIcon
                     sx={styles.svg}
                     style={{ color: "#FF3200" }}
                  />
               ),
               message: "You are disconnected from the internet",
            }
         default:
            return {
               icon: <CachedIcon sx={styles.svg} />,
               message: "Waiting for connection status...",
            }
      }
   }

   const getRtcConnectionInfo = (status) => {
      switch (status) {
         case "CONNECTED":
            return {
               icon: (
                  <ServerIcon sx={styles.svg} style={{ color: gradient[1] }} />
               ),
               message: "You are connected to our streaming server",
            }
         case "CONNECTING":
            return {
               icon: (
                  <WarningIcon sx={styles.svg} style={{ color: "#FFEF00" }} />
               ),
               message: "Attempting to connect to our streaming server...",
            }
         case "DISCONNECTED":
            return {
               icon: (
                  <ErrorOutlineIcon
                     sx={styles.svg}
                     style={{ color: "#FF3200" }}
                  />
               ),
               message: "You are disconnected from our streaming server",
            }
         default:
            return {
               icon: <CachedIcon sx={styles.svg} />,
               message: "Waiting for connection status...",
            }
      }
   }

   const uplinkInfo = useMemo(() => getNetWorkInfo(true)[uplink], [uplink])
   const downlinkInfo = useMemo(() => getNetWorkInfo()[downlink], [downlink])

   /**
    * FIXME: it should be the RTM connection info but its pointing to RTC
    */
   const rtmConnectionInfo = useMemo(
      () => getRtmConnectionInfo(agoraRtcConnectionStatus.curState),
      [agoraRtcConnectionStatus.curState, uplink, downlink]
   )
   const rtcConnectionInfo = useMemo(
      () => getRtcConnectionInfo(agoraRtcConnectionStatus?.curState),
      [agoraRtcConnectionStatus?.curState]
   )

   return (
      <Stack
         onMouseEnter={handleOpen}
         onMouseLeave={handleClose}
         spacing={1}
         sx={styles.root}
      >
         <Stack
            justifyContent="center"
            alignItems={"center"}
            direction={open ? "column" : "row"}
            spacing={1}
         >
            <Tooltip arrow placement="right" title={rtmConnectionInfo.message}>
               <Stack
                  sx={{ width: open ? "100%" : "auto" }}
                  spacing={1}
                  alignItems="left"
                  direction={"row"}
               >
                  <Box display="flex">{rtmConnectionInfo.icon}</Box>
                  {open && (
                     <Box display="flex" sx={styles.text}>
                        Internet
                     </Box>
                  )}
               </Stack>
            </Tooltip>
            <Tooltip arrow placement="right" title={rtcConnectionInfo.message}>
               <Stack
                  sx={{ width: open ? "100%" : "auto" }}
                  spacing={1}
                  direction={"row"}
               >
                  <Box display="flex">{rtcConnectionInfo.icon}</Box>
                  {open && (
                     <Box display="flex" sx={styles.text}>
                        Streaming
                     </Box>
                  )}
               </Stack>
            </Tooltip>
            {proxyActive && (
               <Tooltip
                  arrow
                  placement="right"
                  title={"You are currently connected through a proxy"}
               >
                  <Stack
                     sx={{ width: open ? "100%" : "auto" }}
                     spacing={1}
                     direction={"row"}
                  >
                     <ProxyIcon sx={{ color: "#00F92C" }} />
                     {open && (
                        <Box display="flex" sx={styles.text}>
                           Using Proxy
                        </Box>
                     )}
                  </Stack>
               </Tooltip>
            )}
         </Stack>
         {open && (
            <Stack
               justifyContent={"space-around"}
               direction={"row"}
               sx={{ width: "100%" }}
               spacing={1}
            >
               <Tooltip
                  arrow
                  placement="right"
                  style={{ color: uplinkInfo.color }}
                  title={uplinkInfo.description}
               >
                  <Box marginRight={1} alignItems="center" display="flex">
                     {uplinkInfo.icon}
                     <Box
                        component={ArrowUp}
                        sx={[
                           styles.smallSvg,
                           styles.svgShadow,
                           styles.svg,
                           { color: gradient[uplink] },
                        ]}
                     />
                  </Box>
               </Tooltip>
               <Tooltip
                  arrow
                  placement="right"
                  style={{ color: downlinkInfo.color }}
                  title={downlinkInfo.description}
               >
                  <Box alignItems="center" display="flex">
                     {downlinkInfo.icon}
                     <Box
                        component={ArrowDown}
                        sx={[
                           styles.smallSvg,
                           styles.svgShadow,
                           styles.svg,
                           { color: gradient[downlink] },
                        ]}
                     />
                  </Box>
               </Tooltip>
            </Stack>
         )}
      </Stack>
   )
}

export default WifiIndicator
