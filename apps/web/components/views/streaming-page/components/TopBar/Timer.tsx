import { Box, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useStartedAt } from "store/selectors/streamingAppSelectors"
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
   whiteCircle: {
      bgcolor: "white",
      borderRadius: "50%",
      width: 9,
      height: 9,
      mr: "3px",
   },
   timeText: {
      width: 33,
   },
})

export const Timer = () => {
   const startedAt = useStartedAt()
   const [elapsedTime, setElapsedTime] = useState(
      DateUtil.formatElapsedTime(startedAt)
   )

   useEffect(() => {
      const interval = setInterval(() => {
         const newTime = DateUtil.formatElapsedTime(startedAt)
         setElapsedTime(newTime)
      }, 1000)

      return () => clearInterval(interval)
   }, [startedAt])

   return (
      <Box sx={styles.root}>
         <Box sx={styles.whiteCircle} />
         <Typography sx={styles.timeText} variant="xsmall">
            {elapsedTime}
         </Typography>
      </Box>
   )
}
