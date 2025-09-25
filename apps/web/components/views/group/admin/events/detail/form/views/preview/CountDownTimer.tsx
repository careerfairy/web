import { sxStyles } from "@careerfairy/shared-ui"
import { Divider } from "@mui/material"
import Box from "@mui/material/Box"
import Skeleton from "@mui/material/Skeleton"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { alpha } from "@mui/material/styles"
import { useCountdownToDate } from "components/custom-hook/utils/useCountDownToDate"
import isEmpty from "lodash/isEmpty"
import { memo } from "react"
import DateUtil from "util/DateUtil"

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
   isPast: boolean
   startDate: Date
}
const CountDownTimer = ({ isPast, startDate }: CountdownTimerProps) => {
   return (
      <Stack spacing={1} divider={<Divider sx={styles.divider} />}>
         {Boolean(startDate) && (
            <Typography sx={styles.date} variant={"body1"} textAlign={"center"}>
               {isPast
                  ? DateUtil.formatPastDate(startDate)
                  : DateUtil.formatLiveDate(startDate)}
            </Typography>
         )}
         {isPast ? null : startDate ? (
            <TimerText time={startDate} />
         ) : (
            <CountdownTimerSkeleton />
         )}
      </Stack>
   )
}

const CountdownTimerSkeleton = () => {
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
   const timeLeft = useCountdownToDate(time)

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
