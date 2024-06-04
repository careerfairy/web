import { Stack, Typography } from "@mui/material"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { useCountdownToDate } from "components/custom-hook/utils/useCountDownToDate"
import { useStartsAt } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      color: "neutral.700",
      textAlign: "center",
   },
   time: {
      color: "inherit",
      fontSize: "54px",
      lineHeight: "50px",
   },
   timeLabel: {
      color: "inherit",
      fontWeight: 500,
   },
})

const padWithZero = (num: number) => String(num).padStart(2, "0")

export const CountDown = () => {
   const startsAt = useStartsAt()
   const timeLeft = useCountdownToDate(startsAt)
   const streamIsMobile = useStreamIsMobile()
   return (
      <Stack direction="row" spacing={2} sx={styles.root}>
         {Object.keys(timeLeft).map((key) => (
            <Stack justifyContent="center" key={key}>
               <Typography
                  variant={streamIsMobile ? "desktopBrandedH2" : undefined}
                  sx={streamIsMobile ? undefined : styles.time}
                  fontWeight={700}
               >
                  {key === "Minutes" || key === "Seconds"
                     ? padWithZero(timeLeft[key])
                     : timeLeft[key]}
               </Typography>
               <Typography
                  variant={streamIsMobile ? "xsmall" : "medium"}
                  sx={styles.timeLabel}
               >
                  {key}
               </Typography>
            </Stack>
         ))}
      </Stack>
   )
}
