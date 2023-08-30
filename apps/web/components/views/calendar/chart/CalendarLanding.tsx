import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { Box, Button, Stack, Typography } from "@mui/material"
import CalendarFilter from "./CalendarFilter"
import React from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   stack: { height: "100%", backgroundColor: "white", borderRadius: "5px" },
   textDisplay: {
      width: "42%",
      backgroundColor: "secondary.main",
      borderRadius: "5px",
   },
   title: {
      mt: "61px",
      ml: "25px",
      mr: "25px",
      fontWeight: 900,
      color: "white",
   },
   text: { mt: "16px", fontSize: 16 },
   filterDisplay: {
      width: "58%",
      mt: "30px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
   },
   buttonContainer: { mb: "60px" },
   button: { ml: 4, mt: "auto", width: 150 },
})

type Props = {
   selectedUniversities: OptionGroup[]
   setIsCalendarView: (val: boolean) => void
}

const CalendarLanding = ({
   selectedUniversities,
   setIsCalendarView,
}: Props) => {
   return (
      <Stack direction={"row"} sx={styles.stack}>
         <Box sx={styles.textDisplay}>
            <Typography variant="h2" sx={styles.title}>
               Academic Calendar
               <Typography sx={styles.text}>
                  Select your preferences and browse through the academic
                  calendars of your target audience
               </Typography>
            </Typography>
         </Box>
         <Box sx={styles.filterDisplay}>
            <CalendarFilter multiCheckboxSelectType={"unjustified"} />
            <Box sx={styles.buttonContainer}>
               <Button
                  sx={styles.button}
                  variant={"contained"}
                  color={"secondary"}
                  onClick={() => setIsCalendarView(true)}
                  disabled={selectedUniversities.length <= 0}
               >
                  Next
               </Button>
            </Box>
         </Box>
      </Stack>
   )
}

export default CalendarLanding
