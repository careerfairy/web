import { Stack, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { WarningIcon } from "../components/WarningIcon"
import { timeFrameLabels } from "../util"

const styles = sxStyles({
   root: {
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "309px",
      marginTop: "-21px",
   },
   container: {
      width: {
         xs: "100%",
         md: "50%",
      },
      alignItems: "center",
      textAlign: "center",
   },
   icon: {
      fontSize: 48,
   },
   header: {
      color: "#7A7A8E",
      fontWeight: 600,
      fontSize: "1.425rem",
      lineHeight: "30px",
   },
   body: {
      color: "#9999B1",
      fontWeight: 400,
      fontSize: "1.15rem",
      lineHeight: "27px",
   },
})

type EmptySparksListProps = {
   targetLabel: "industry" | "audience"
   timePeriod: string
}

export const EmptySparksList = ({
   targetLabel,
   timePeriod,
}: EmptySparksListProps) => {
   return (
      <Stack direction="row" sx={styles.root}>
         <Stack direction="column" spacing={3} sx={styles.container}>
            <WarningIcon sx={styles.icon} />
            <Typography sx={styles.header}>
               No Sparks data to show in this time period.
            </Typography>
            <Typography sx={styles.body}>
               During the {timeFrameLabels[timePeriod].toLowerCase()} no Sparks
               from the selected industry were public. Choose another{" "}
               {targetLabel} or time range to see the top Sparks.
            </Typography>
         </Stack>
      </Stack>
   )
}
