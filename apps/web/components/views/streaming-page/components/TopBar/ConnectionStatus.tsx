import { combineStyles, sxStyles } from "types/commonTypes"

import { ResponsiveStreamButton } from "../Buttons"
import { AlertCircle, CheckCircle, XCircle } from "react-feather"
import React, { useMemo } from "react"
import { Box, Stack, SxProps, Tooltip } from "@mui/material"
import {
   ConnectionState,
   useConnectionState,
   useNetworkQuality,
} from "agora-rtc-react"
import { WifiIcon } from "./WifiIcon"
import { SuspenseWithBoundary } from "components/ErrorBoundary"

const styles = sxStyles({
   root: {
      border: (theme) => `1px solid ${theme.brand.black[400]}`,
      cursor: "default",
      px: 1.5,
      py: {
         xs: 0.5,
         tablet: 1,
      },
      "& svg": {
         width: {
            xs: 20,
            tablet: 24,
         },
         height: {
            xs: 20,
            tablet: 24,
         },
      },
   },
   iconWrapper: {
      display: "flex",
   },
   error: {
      color: (theme) => theme.palette.error["600"],
   },
   warning: {
      color: (theme) => theme.palette.warning["600"],
   },
   tooltip: {
      textAlign: "center",
      color: (theme) => theme.palette.neutral["700"],
      fontSize: "12px",
      fontWeight: 400,
      py: 1,
   },
})

const ConnectionStates: Record<ConnectionState, ConnectionState> = {
   CONNECTED: "CONNECTED",
   CONNECTING: "CONNECTING",
   RECONNECTING: "RECONNECTING",
   DISCONNECTED: "DISCONNECTED",
   DISCONNECTING: "DISCONNECTING",
}

const getRtcConnectionInfo = (status: ConnectionState) => {
   switch (status) {
      case ConnectionStates.CONNECTED:
         return {
            icon: <Box component={CheckCircle} />,
            description: "You are connected to our streaming server",
         }
      case ConnectionStates.CONNECTING:
      case ConnectionStates.RECONNECTING:
         return {
            icon: <Box component={AlertCircle} sx={styles.warning} />,
            description: "Attempting to connect to our streaming server...",
         }
      case ConnectionStates.DISCONNECTED:
         return {
            icon: <Box component={XCircle} sx={styles.error} />,
            description: "You are disconnected from our streaming server",
         }
      default:
         return {
            icon: <Box component={AlertCircle} sx={styles.warning} />,
            description: "Waiting for connection status...",
         }
   }
}

type NetworkInfo = {
   description: string
   barsNumber: number
   style?: SxProps
}
const networkInfo: Record<number, NetworkInfo> = {
   0: {
      description: "The network quality is unknown",
      barsNumber: 0,
   },
   1: {
      description: `The network quality is excellent`,
      barsNumber: 4,
   },
   2: {
      description: `The network quality is good, but lower than optimal`,
      barsNumber: 4,
   },
   3: {
      description: `The network quality is okay, but viewers might experience delays in your video and audio`,
      style: styles.warning,
      barsNumber: 3,
   },
   4: {
      description: `The network quality is poor, viewers won't be able to see you smoothly`,
      style: styles.error,
      barsNumber: 2,
   },
   5: {
      description: `The network quality is so poor that viewers will barely see and hear you`,
      style: styles.error,
      barsNumber: 2,
   },
   6: {
      description: `The network is down and viewers cannot see nor hear you`,
      style: styles.error,
      barsNumber: 0,
   },
}

export const ConnectionStatus = () => {
   return (
      <SuspenseWithBoundary fallback={<></>}>
         <Component />
      </SuspenseWithBoundary>
   )
}

const Component = () => {
   const agoraRtcConnectionStatus = useConnectionState()
   const networkQuality = useNetworkQuality()

   const rtcConnectionInfo = useMemo(
      () => getRtcConnectionInfo(agoraRtcConnectionStatus),
      [agoraRtcConnectionStatus]
   )

   const uplinkInfo = useMemo(
      () => networkInfo[networkQuality.uplinkNetworkQuality],
      [networkQuality.uplinkNetworkQuality]
   )

   return (
      <ResponsiveStreamButton
         sx={styles.root}
         variant="outlined"
         disableTouchRipple
      >
         <Stack spacing={1.25} direction="row">
            <Tooltip
               arrow
               placement="bottom"
               title={uplinkInfo.description}
               componentsProps={{
                  tooltip: {
                     sx: styles.tooltip,
                  },
               }}
            >
               <Box sx={combineStyles(styles.iconWrapper, uplinkInfo.style)}>
                  <WifiIcon barsNumber={uplinkInfo.barsNumber} />
               </Box>
            </Tooltip>
            <Tooltip
               arrow
               placement="bottom"
               title={rtcConnectionInfo.description}
               componentsProps={{
                  tooltip: {
                     sx: styles.tooltip,
                  },
               }}
            >
               {rtcConnectionInfo.icon}
            </Tooltip>
         </Stack>
      </ResponsiveStreamButton>
   )
}
