import React, {
   createContext,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react"
import { Box, Button, IconButton, Paper, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { PlusCircle as AddIcon } from "react-feather"
import { useTimelineCountries } from "components/custom-hook/university-timeline/useTimelineCountries"
import { AcademicYearType, AcademicYears, getAcademicYears } from "../utils"
import AcademicYearSelector from "./AcademicYearSelector"
import TimelineCountryAccordion from "./TimelineCountryAccordion"
import SingleListSelect from "components/views/common/SingleListSelect"
import { universityCountriesMap } from "components/util/constants/universityCountries"
import { Check as CheckIcon, X as XIcon } from "react-feather"
import { useTheme } from "@mui/styles"
import { UniversityTimelineInstance as timelineService } from "data/firebase/UniversityTimelineService"
import { TimelineCountry } from "@careerfairy/shared-lib/universities/universityTimeline"

const styles = sxStyles({
   headerContainer: {
      m: "20px",
      mr: "0px",
      mt: "50px",
      display: "flex",
      justifyContent: "space-between",
   },
   yearSelector: {
      mt: "10px",
   },
   title: {
      display: "inline-block",
      fontWeight: 900,
      fontSize: "20px",
      mt: "3px",
      pr: "20px",
   },
   button: {
      textTransform: "none",
      height: "40px",
      fontSize: "16px",
   },
   countriesContainer: {
      mb: "50px",
   },
   countryContainer: {
      mt: "20px",
   },
   addCountryContainer: {
      borderRadius: "30px!important",
      p: "10px",
      display: "flex",
      "& .MuiAutocomplete-root": {
         width: "100%",
      },
   },
   addCountry: {
      fontSize: "18px",
   },
   iconButton: {
      mt: "3px",
   },
   addCountryCheckbox: {
      width: 20,
      height: 20,
      borderRadius: 3,
      bgcolor: "tertiary.main",
      color: "black",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
   addCountryCheck: {
      borderRadius: 3,
      bgcolor: "black.main",
      color: "black",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      p: "6px",
   },
   addCountryInput: {
      "& .MuiInputBase-root": {
         borderRadius: "50px!important",
         border: "1px solid",
         borderColor: "#EDE7FD",
         backgroundColor: "#F7F8FC",
         pt: "20px",
      },
      "& .MuiFilledInput-root": {
         pt: "5px",
         pb: "5px",
      },
   },
})

type CalendarManagerContextType = {
   academicYear: AcademicYearType
   setAcademicYear: (academicYear: AcademicYearType) => void
   academicYears: AcademicYears | null
}

const CalendarManagerContext = createContext<CalendarManagerContextType>({
   academicYear: "currentYear",
   setAcademicYear: () => {},
   academicYears: null,
})

export const useCalendarManager = () => {
   const context = useContext(CalendarManagerContext)

   if (!context) {
      throw new Error(
         "useCalendarManager must be used within a CalendarManagerProvider"
      )
   }

   return context
}

const TimelineCountriesManager = () => {
   const [academicYear, setAcademicYear] =
      useState<AcademicYearType>("currentYear")
   const [addingCountry, setAddingCountry] = useState(false)
   const { data: unsortedTimelineCountries } = useTimelineCountries()

   const timelineCountries = useMemo(
      () =>
         unsortedTimelineCountries?.sort((country1, country2) =>
            universityCountriesMap[country1.id].localeCompare(
               universityCountriesMap[country2.id]
            )
         ),
      [unsortedTimelineCountries]
   )

   const contextValues = useMemo<CalendarManagerContextType>(
      () => ({
         academicYear: academicYear,
         setAcademicYear: setAcademicYear,
         academicYears: getAcademicYears(),
      }),
      [academicYear]
   )

   return (
      <CalendarManagerContext.Provider value={contextValues}>
         <Box sx={styles.headerContainer}>
            <Box>
               <Typography sx={styles.title}> Countries </Typography>
               <AcademicYearSelector />
            </Box>
            <Button
               onClick={() => setAddingCountry(true)}
               variant={"outlined"}
               sx={styles.button}
               color={"secondary"}
               endIcon={<AddIcon />}
            >
               Add new country
            </Button>
         </Box>
         <Box sx={styles.countriesContainer}>
            {addingCountry ? (
               <AddTimelineCountrySlot
                  timelineCountries={timelineCountries}
                  setAddingCountry={setAddingCountry}
               />
            ) : null}
            {timelineCountries?.map((country) => (
               <Box key={country.id} sx={styles.countryContainer}>
                  <TimelineCountryAccordion
                     countryCode={country.id}
                     academicYear={academicYear}
                  />
               </Box>
            ))}
         </Box>
      </CalendarManagerContext.Provider>
   )
}

type AddProps = {
   timelineCountries: TimelineCountry[]
   setAddingCountry: (option: boolean) => void
}

const AddTimelineCountrySlot = ({
   timelineCountries,
   setAddingCountry,
}: AddProps) => {
   const theme = useTheme()
   const [selectedCountry, setSelectedCountry] = useState(null)

   const options = useMemo(
      () =>
         Object.keys(universityCountriesMap)
            .sort((countryCode1, countryCode2) =>
               universityCountriesMap[countryCode1].localeCompare(
                  universityCountriesMap[countryCode2]
               )
            )
            .map((countryCode) => {
               return { id: countryCode }
            }),
      []
   )

   const disabledOptions = useMemo(
      () => timelineCountries.map((country) => country.id),
      [timelineCountries]
   )

   const handleCancel = useCallback(
      () => setAddingCountry(false),
      [setAddingCountry]
   )

   const handleConfirm = useCallback(() => {
      if (selectedCountry) {
         timelineService.addTimelineCountry(selectedCountry.id)
      }
      setAddingCountry(false)
   }, [selectedCountry, setAddingCountry])

   return (
      <Paper variant={"outlined"} sx={styles.addCountryContainer}>
         <SingleListSelect
            inputName={"newCountry"}
            inputProps={customAddCountryInputProps}
            isCheckbox
            checkboxProps={customCheckboxProps}
            selectedItem={selectedCountry}
            options={options}
            getLabelFn={(option) => universityCountriesMap[option.id]}
            onSelectItem={(option) => setSelectedCountry(option)}
            disabledValues={disabledOptions}
            noColorOnSelect
         />
         <IconButton sx={styles.iconButton} onClick={handleCancel}>
            <XIcon color={theme.palette.tertiary.dark} />
         </IconButton>
         <IconButton
            sx={styles.iconButton}
            onClick={handleConfirm}
            disabled={!selectedCountry}
         >
            <CheckIcon
               color={
                  selectedCountry
                     ? theme.palette.primary.main
                     : theme.palette.grey.main
               }
            />
         </IconButton>
      </Paper>
   )
}

const customCheckboxProps = {
   icon: <Box sx={styles.addCountryCheckbox} />,
   checkedIcon: (
      <Box sx={styles.addCountryCheckbox}>
         <Box sx={styles.addCountryCheck}></Box>
      </Box>
   ),
   color: "default",
}

const customAddCountryInputProps = {
   placeholder: "Search country",
   variant: "filled",
   sx: styles.addCountryInput,
}

export default TimelineCountriesManager
