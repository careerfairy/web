import React from "react"
import AcademicCalendar from "../../components/views/calendar/chart/AcademicCalendar"
import { Box } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   container: {
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
})
const AcademicCalendarEmbed = () => {
   return (
      <Box sx={styles.container}>
         <AcademicCalendar />
      </Box>
   )
}

export default AcademicCalendarEmbed
