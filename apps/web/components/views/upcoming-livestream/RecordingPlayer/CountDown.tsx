import { Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import DateUtil from "../../../../util/DateUtil"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"

type Props = {
   stream: LivestreamPresenter
}
const CountDown = ({ stream }: Props) => {
   const [countDown, setCountDown] = useState("")

   const saveTimeLeft = (maxDateToShowRecording: Date) => {
      const timeLeft = DateUtil.calculateTimeLeft(maxDateToShowRecording)
      setCountDown(
         `${timeLeft.Days || 0}d ${timeLeft.Hours || 0}h ${
            timeLeft.Minutes || 0
         }min ${timeLeft.Seconds || 0}sec`
      )
   }

   useEffect(() => {
      const maxDateToShowRecording = stream.recordingAccessTimeLeft()

      // This calculates the remaining time to access to the recording on the mount
      saveTimeLeft(maxDateToShowRecording)

      const interval = setInterval(() => {
         // This calculates every second the remaining time to access to the recording
         saveTimeLeft(maxDateToShowRecording)
      }, 1000)

      return () => clearTimeout(interval)
   }, [stream])

   return (
      <Typography
         variant="inherit"
         display="inline"
         fontWeight="bold"
         color="primary"
      >
         {countDown}
      </Typography>
   )
}

export default CountDown
