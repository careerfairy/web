import React, { useMemo } from "react"
import { useCurrentStream } from "../../../../../context/stream/StreamContext"
import { CountdownCircleTimer } from "react-countdown-circle-timer"
import { Backdrop, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import { colorsArray } from "../../../../util/colors"
import Box from "@mui/material/Box"
import useStreamToken from "../../../../custom-hook/useStreamToken"
import { useRouter } from "next/router"

const useStyles = makeStyles((theme) => ({
   backdrop: {
      zIndex: theme.zIndex.tooltip,
   },
   time: {
      fontSize: "32px",
   },
   title: {
      color: theme.palette.common.white,
      padding: theme.spacing(0, 3),
   },
}))

const timerProps = {
   size: 240,
   strokeWidth: 10,
}

const minuteSeconds = 10

const StreamClosedCountdown = () => {
   const classes = useStyles()
   const links = useStreamToken({ forStreamType: "mainLivestream" })
   const theme = useTheme()
   const {
      currentLivestream: { hasStarted, hasEnded },
      isBreakout,
      isStreamer,
      isMainStreamer,
   } = useCurrentStream()

   const renderTime = (dimension, time) => {
      return (
         <div className="time-wrapper">
            <Typography align="center" variant="h2">
               {time}
            </Typography>
            <Typography variant="h6">{dimension}</Typography>
         </div>
      )
   }

   const getTimeSeconds = (time) => (minuteSeconds - time) | 0

   const handleComplete = () => {
      window.location.href = isMainStreamer
         ? links.mainStreamerLink
         : isStreamer
         ? links.joiningStreamerLink
         : links.viewerLink
   }

   const startCountDown = Boolean(
      isBreakout &&
         !hasStarted &&
         hasEnded &&
         Boolean(Object.keys(links).length)
   )

   return (
      <Backdrop className={classes.backdrop} open={startCountDown}>
         <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
         >
            <Typography
               className={classes.title}
               gutterBottom
               align="center"
               variant="h4"
            >
               This room has been closed, you will be re-directed in
            </Typography>
            <CountdownCircleTimer
               isPlaying={startCountDown}
               key={links.viewerLink}
               onComplete={handleComplete}
               duration={10}
               colors={[
                  [theme.palette.primary.main, 0.33],
                  [colorsArray[1], 0.33],
                  [theme.palette.secondary.main, 0.33],
               ]}
            >
               {({ elapsedTime }) =>
                  renderTime("seconds", getTimeSeconds(elapsedTime))
               }
            </CountdownCircleTimer>
         </Box>
      </Backdrop>
   )
}

export default StreamClosedCountdown
