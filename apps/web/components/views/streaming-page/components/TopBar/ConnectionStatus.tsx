import { sxStyles } from "types/commonTypes"

import { ResponsiveStreamButton } from "../Buttons"
import { AlertCircle, CheckCircle, XCircle } from "react-feather"
import React, { useMemo } from "react"
import { Box, Stack, Tooltip, styled } from "@mui/material"
import { useSelector } from "react-redux"
import { rtcStateSelector } from "store/selectors/streamingAppSelectors"
import { useNetworkQuality } from "agora-rtc-react"
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

enum ConnectionStates {
   CONNECTED = "CONNECTED",
   CONNECTING = "CONNECTING",
   RECONNECTING = "RECONNECTING",
   DISCONNECTED = "DISCONNECTED",
}

const getRtcConnectionInfo = (status) => {
   switch (status) {
      case ConnectionStates.CONNECTED:
         return {
            icon: styled(CheckCircle)({}),
            description: "You are connected to our streaming server",
         }
      case ConnectionStates.CONNECTING || ConnectionStates.RECONNECTING:
         return {
            icon: styled(AlertCircle)(({ theme }) => ({
               color: styles.warning.color(theme),
            })),
            description: "Attempting to connect to our streaming server...",
         }
      case ConnectionStates.DISCONNECTED:
         return {
            icon: styled(XCircle)(({ theme }) => ({
               color: styles.error.color(theme),
            })),
            description: "You are disconnected from our streaming server",
         }
      default:
         return {
            icon: styled(AlertCircle)(({ theme }) => ({
               color: styles.warning.color(theme),
            })),
            description: "Waiting for connection status...",
         }
   }
}

const getNetWorkInfo = () => {
   return [
      {
         description: `The upload network quality is unknown`,
         barsNumber: 0,
      },
      {
         description: `The upload network quality is excellent`,
         barsNumber: 4,
      },
      {
         description: `The upload network quality is good, but the bitrate may be slightly lower than optimal`,
         style: styles.warning,
         barsNumber: 4,
      },
      {
         description: `Users experience slightly impaired communication with this upload quality`,
         style: styles.warning,
         barsNumber: 3,
      },
      {
         description: `Users cannot communicate smoothly with this upload quality`,
         style: styles.error,
         barsNumber: 3,
      },
      {
         description: `The upload network quality is so poor that users can barely communicate`,
         style: styles.error,
         barsNumber: 2,
      },
      {
         description: `The upload network quality is down and users cannot communicate at all`,
         style: styles.error,
         barsNumber: 0,
      },
   ]
}

export const ConnectionStatus = () => {
   return (
      <SuspenseWithBoundary fallback={<></>}>
         <Component />
      </SuspenseWithBoundary>
   )
}

const Component = () => {
   const agoraRtcConnectionStatus = useSelector(rtcStateSelector)
   const networkQuality = useNetworkQuality()
   const rtcConnectionInfo = useMemo(
      () =>
         getRtcConnectionInfo(
            agoraRtcConnectionStatus.connectionState?.currentState
         ),
      [agoraRtcConnectionStatus.connectionState]
   )

   const uplinkInfo = useMemo(
      () => getNetWorkInfo()[networkQuality.uplinkNetworkQuality],
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
               <Box sx={[styles.iconWrapper, uplinkInfo.style]}>
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
               {<rtcConnectionInfo.icon />}
            </Tooltip>
         </Stack>
      </ResponsiveStreamButton>
   )
}
