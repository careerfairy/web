import { Box, Stack, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import {
   useHasStarted,
   useStartedAt,
} from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"

const styles = sxStyles({
   root: {
      bgcolor: "error.500",
      color: "white",
      p: 1,
      borderRadius: "3px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   },
   circular: {
      borderRadius: "50%",
   },
   whiteCircle: {
      bgcolor: "white",
      borderRadius: "50%",
      width: 9,
      height: 9,
   },
   timeText: {
      width: 30,
   },
   timeTextWide: {
      width: 50,
   },
})

export const Timer = () => {
   const startedAt = useStartedAt()
   const hasStarted = useHasStarted()

   const [elapsedTime, setElapsedTime] = useState(
      DateUtil.formatElapsedTime(startedAt)
   )

   useEffect(() => {
      if (hasStarted && startedAt) {
         const interval = setInterval(() => {
            setElapsedTime(DateUtil.formatElapsedTime(startedAt))
         }, 1000)

         return () => clearInterval(interval)
      }
   }, [startedAt, hasStarted])

   const timeHasHours = elapsedTime.match(/:/g)?.length === 2

   if (!hasStarted) return null

   return (
      <Stack direction="row" spacing={0.375} sx={styles.root}>
         <Box sx={styles.whiteCircle} />
         {startedAt ? (
            <Typography
               sx={timeHasHours ? styles.timeTextWide : styles.timeText}
               variant="xsmall"
            >
               {elapsedTime}
            </Typography>
         ) : (
            <Typography variant="xsmall">LIVE</Typography>
         )}
      </Stack>
   )
}
