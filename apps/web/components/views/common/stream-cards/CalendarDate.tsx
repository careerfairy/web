import { Box, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"

const styles = sxStyles({
   calendarDate: {
      display: "flex",
      flexDirection: "column",
      textAlign: "center",
      justifyContent: "center",
      backgroundColor: "white",
      width: "56px",
      height: "64px",
      padding: "12px",
      gap: "-4px",
      flexShrink: 0,
      borderRadius: "0px 0px 6px 6px",
      boxShadow: "0px 0px 12px 0px rgba(20, 20, 20, 0.08)",
      position: "absolute",
      marginRight: "12px",
   },
   startDay: {
      color: (theme) => theme.palette.primary.main,
      fontWeight: 700,
   },
   startMonth: {
      textAlign: "center",
      fontWeight: "400",
      marginTop: "-4px",
      color: (theme) => theme.palette.neutral[900],
      "&::first-letter": {
         textTransform: "uppercase",
      },
   },
})

export const CalendarDate = ({ startDate }: { startDate: Date }) => {
   const startDay = startDate ? new Date(startDate).getDate() : null

   const startMonth = startDate
      ? DateUtil.getMonth(new Date(startDate).getMonth(), true).toLowerCase()
      : null

   if (!startDay || !startMonth) {
      return null
   }

   return (
      <Box sx={styles.calendarDate}>
         <Typography variant={"brandedH3"} sx={styles.startDay}>
            {startDay}
         </Typography>
         <Typography variant={"xsmall"} sx={styles.startMonth}>
            {startMonth}
         </Typography>
      </Box>
   )
}
