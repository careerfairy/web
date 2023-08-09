import React from "react"
import { Box, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import ContentButton from "components/views/portal/content-carousel/ContentButton"
import { ExternalLink as LinkIcon } from "react-feather"
import TimelineCountriesManager from "./TimelineCountriesManager"

const styles = sxStyles({
   titleContainer: { textAlign: "center", mt: "52px", ml: "40px", mr: "40px" },
   title: { display: "inline", fontSize: "32px", fontWeight: 900 },
   titleText: { width: "592px", color: "#565656", margin: "auto", mt: "10px" },
   calendarButton: {
      fontSize: "16px",
      fontWeight: 400,
      textTransform: "none",
      height: "45px",
      mt: "10px",
   },
   buttonText: { marginLeft: "10px" },
})

const CalendarManager = () => {
   return (
      <>
         <Box sx={styles.titleContainer}>
            <Typography sx={styles.title}> Academic </Typography>
            <Typography sx={styles.title} color="secondary.main">
               Calendar
            </Typography>
            <Typography sx={styles.titleText}>
               Manage the Academic Calendar effortlessly. Add new countries,
               universities, and update dates for lecture periods, exams, and
               vacations. Keep our clients informed with accurate and up-to-date
               information.
            </Typography>
            <ContentButton
               sx={styles.calendarButton}
               color={"secondary"}
               href={"/admin/academic-calendar"}
               endIcon={<LinkIcon />}
            >
               View Academic Calendar
            </ContentButton>
            <TimelineCountriesManager />
         </Box>
      </>
   )
}

export default CalendarManager
