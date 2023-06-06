import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { FC, memo, useCallback, useEffect, useState } from "react"
import Stack from "@mui/material/Stack"
import { Divider } from "@mui/material"
import Typography from "@mui/material/Typography"
import DateUtil from "../../../../../util/DateUtil"
import { sxStyles } from "../../../../../types/commonTypes"
import { alpha } from "@mui/material/styles"
import { isEmpty } from "lodash/fp"
import Box from "@mui/material/Box"
import Skeleton from "@mui/material/Skeleton"

const styles = sxStyles({
   date: {
      fontWeight: 500,
   },
   divider: {
      borderColor: (theme) => alpha(theme.palette.common.white, 0.3),
      width: "95%",
      mx: "auto !important",
   },
   dividerSkeleton: {
      borderColor: "rgba(0, 0, 0, 0.11)",
   },

   // TimerText
   countDownWrapper: {
      flexWrap: "nowrap",
      display: "flex",
      justifyContent: "space-around",
      width: "100%",
   },
   timeElement: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   timeType: {
      fontWeight: 400,
      fontSize: "0.75rem",
   },
   timeLeft: {
      fontWeight: 700,
   },
})

type CountdownTimerProps = {
   presenter: LivestreamPresenter
}
const CountDownTimer: FC<CountdownTimerProps> = ({ presenter }) => {
   const isPast = presenter.isPast()
   return (
      <Stack spacing={1} divider={<Divider sx={styles.divider} />}>
         <Typography sx={styles.date} variant={"body1"} textAlign={"center"}>
            {isPast
               ? DateUtil.formatPastDate(presenter.start)
               : DateUtil.formatLiveDate(presenter.start)}
         </Typography>
         {isPast ? null : <TimerText time={presenter.start} />}
      </Stack>
   )
}

export const CountdownTimerSkeleton = () => {
   return (
      <Stack
         spacing={1}
         divider={<Divider sx={[styles.divider, styles.dividerSkeleton]} />}
      >
         <Typography sx={styles.date} variant={"body1"} textAlign={"center"}>
            <Skeleton variant={"text"} />
         </Typography>
         <TimerTextSkeleton />
      </Stack>
   )
}

const TimerTextSkeleton = () => {
   return (
      <Stack direction="row" spacing={2} sx={styles.countDownWrapper}>
         {Array.from(Array(4).keys()).map((index) => (
            <Box key={index} sx={styles.timeElement}>
               <Typography variant="h5" sx={styles.timeLeft}>
                  <Skeleton variant={"text"} width={50} />
               </Typography>
               <Typography variant="body1" sx={styles.timeType}>
                  <Skeleton variant={"text"} width={50} />
               </Typography>
            </Box>
         ))}
      </Stack>
   )
}

const TimerText = memo(function TimerText({ time }: { time: Date }) {
   const calculateTimeLeft = useCallback(
      () => DateUtil.calculateTimeLeft(time),
      [time]
   )

   const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

   useEffect(() => {
      const interval = setInterval(() => {
         const newTimeLeft = calculateTimeLeft()
         setTimeLeft(newTimeLeft)
      }, 1000)
      return () => clearInterval(interval)
   }, [calculateTimeLeft])

   if (isEmpty(timeLeft)) return null

   return (
      <Box sx={styles.countDownWrapper}>
         {Object.keys(timeLeft).map((interval, index) => (
            <Box key={index} sx={styles.timeElement}>
               <Typography variant="h5" sx={styles.timeLeft}>
                  {timeLeft[interval]}
               </Typography>
               <Typography variant="body1" sx={styles.timeType}>
                  {interval}
               </Typography>
            </Box>
         ))}
      </Box>
   )
})

export default CountDownTimer
