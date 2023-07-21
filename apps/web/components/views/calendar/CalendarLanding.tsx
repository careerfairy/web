import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { TimelineUniversity } from "@careerfairy/shared-lib/universities/universityTimeline"
import { Box, Stack, Typography } from "@mui/material"
import CalendarFilter from "components/views/calendar/CalendarFilter"
import ContentButton from "components/views/portal/content-carousel/ContentButton"
import React from "react"

const CalendarLanding = ({
   allUniversityOptions, // all universities to be considered
   selectedUniversities,
   setSelectedUniversities,
   selectedCountries,
   setSelectedCountries,
   universityOptions,
   setUniversityOptions,
   setIsCalendarView,
}: Props) => {
   return (
      <Stack height="100%" direction="row" sx={{ backgroundColor: "white" }}>
         <Box sx={{ width: "40%", backgroundColor: "secondary.main" }}>
            <Typography
               sx={{ m: 5 }}
               variant="h2"
               fontWeight={900}
               color="white"
            >
               Academic Calendar
               <Typography sx={{ mt: 3 }} fontSize={20}>
                  Select your preferences and browse through the academic
                  calendars of your target audience
               </Typography>
            </Typography>
         </Box>
         <Box sx={{ width: "60%" }}>
            <CalendarFilter
               allUniversityOptions={allUniversityOptions}
               selectedUniversities={selectedUniversities}
               setSelectedUniversities={setSelectedUniversities}
               selectedCountries={selectedCountries}
               setSelectedCountries={setSelectedCountries}
               universityOptions={universityOptions}
               setUniversityOptions={setUniversityOptions}
               isTextRightOfCheckbox={true}
            ></CalendarFilter>
            <ContentButton
               sx={{ ml: 4, mt: 4, width: 150 }}
               onClick={() => setIsCalendarView(true)}
               color="secondary"
               disabled={selectedUniversities.length <= 0}
            >
               Next
            </ContentButton>
         </Box>
      </Stack>
   )
}

type Props = {
   allUniversityOptions: TimelineUniversity[]
   selectedUniversities: OptionGroup[]
   setSelectedUniversities: (options: OptionGroup[]) => void
   selectedCountries: OptionGroup[]
   setSelectedCountries: (options: OptionGroup[]) => void
   universityOptions: OptionGroup[]
   setUniversityOptions: (options: OptionGroup[]) => void
   setIsCalendarView: (val: boolean) => void
}

export default CalendarLanding
