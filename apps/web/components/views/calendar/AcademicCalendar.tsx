import React, { createContext, useCallback, useMemo, useState } from "react"
import { useUniversityPeriodsByIdsAndStart } from "components/custom-hook/university-timeline/useUniversityPeriods"
import { useTimelineUniversities } from "components/custom-hook/university-timeline/useTimelineUniversities"
import {
   TimelineUniversity,
   UniversityPeriodObject,
} from "@careerfairy/shared-lib/universities/universityTimeline"
import CalendarFilter from "components/views/calendar/CalendarFilter"
import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import CalendarLanding from "./CalendarLanding"
import CalendarChart from "./CalendarChart"
import { Box } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   container: {
      height: "100%",
      width: "100%",
      maxHeight: "487px",
      maxWidth: "822px",
   },
})

type CalendarContextType = {
   allUniversityOptions: TimelineUniversity[]
   selectedUniversities: OptionGroup[]
   setSelectedUniversities: (options: OptionGroup[]) => void
   selectedCountries: OptionGroup[]
   setSelectedCountries: (options: OptionGroup[]) => void
   universityOptions: OptionGroup[]
   setUniversityOptions: (options: OptionGroup[]) => void
}

export const CalendarContext = createContext<CalendarContextType>({
   allUniversityOptions: [],
   selectedUniversities: [],
   setSelectedUniversities: () => {},
   selectedCountries: [],
   setSelectedCountries: () => {},
   universityOptions: [],
   setUniversityOptions: () => {},
})

const AcademicCalendar = () => {
   const [selectedUniversities, setSelectedUniversities] = useState<
      OptionGroup[]
   >([])
   const [selectedCountries, setSelectedCountries] = useState<OptionGroup[]>([])
   const [universityOptions, setUniversityOptions] = useState<OptionGroup[]>([])
   const [isCalendarView, setIsCalendarView] = useState(false)
   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

   let { data: allUniversityOptions } = useTimelineUniversities()

   // take only periods from the last academic year to the next one
   const currentDate = useMemo(() => new Date(), [])
   const start = useMemo(
      () =>
         currentDate.getMonth() <= 7
            ? new Date(currentDate.getFullYear() - 2, 8, 1)
            : new Date(currentDate.getFullYear() - 1, 8, 1),
      [currentDate]
   )

   const end = useMemo(
      () =>
         currentDate.getMonth() <= 7
            ? new Date(currentDate.getFullYear() + 1, 8, 1)
            : new Date(currentDate.getFullYear() + 2, 8, 1),
      [currentDate]
   )

   // need to filter timeframe in 2 steps since firestore does not support inequalities on several fields
   let { data: periods } = useUniversityPeriodsByIdsAndStart(
      allUniversityOptions?.map((universityOption) => universityOption.id),
      start
   )

   periods = useMemo(
      () =>
         periods ? periods.filter((period) => period.end.toDate() < end) : [],
      [end, periods]
   )

   // update to only include those that have periods in the timeframe
   allUniversityOptions = useMemo(
      () =>
         allUniversityOptions
            ? allUniversityOptions.filter((universityOption) =>
                 periods
                    .map((period) => period.timelineUniversityId)
                    .includes(universityOption.id)
              )
            : [],
      [periods, allUniversityOptions]
   )

   // update to only include those in the current selection
   const selectedPeriods = useMemo(
      () =>
         periods.filter((period) =>
            selectedUniversities
               .map((university) => university.id)
               .includes(period.timelineUniversityId)
         ),
      [periods, selectedUniversities]
   )

   const getUniversityName = useCallback(
      (id: string, universities: OptionGroup[]) => {
         const university = universities.find((uni) => uni.id === id)
         return university ? university.name : undefined
      },
      []
   )

   const periodToDataPoint = useCallback(
      (period, universities) => ({
         x: getUniversityName(period.timelineUniversityId, universities),
         y: [period.start.toMillis(), period.end.toMillis()],
      }),
      [getUniversityName]
   )

   const seriesData = useMemo(() => {
      const seriesData = []
      if (!selectedPeriods || selectedPeriods.length <= 0) {
         // need at least one element for the graph to display at all
         // and we need the toolbar to stay
         seriesData.push({
            name: "empty",
            data: [{ x: ["No available data"], y: [0, 0] }],
         })
         return seriesData
      }
      Object.values(UniversityPeriodObject).forEach(function (type) {
         let dataArray = []
         dataArray = selectedPeriods
            .filter((period) => period.type == type)
            .map((period) => periodToDataPoint(period, selectedUniversities))
         seriesData.push({
            name: type.charAt(0).toUpperCase() + type.slice(1),
            data: dataArray,
         })
      })
      return seriesData
   }, [periodToDataPoint, selectedPeriods, selectedUniversities])

   const contextValues = useMemo<CalendarContextType>(
      () => ({
         allUniversityOptions,
         selectedUniversities,
         setSelectedUniversities,
         selectedCountries,
         setSelectedCountries,
         universityOptions,
         setUniversityOptions,
      }),
      [
         allUniversityOptions,
         selectedCountries,
         selectedUniversities,
         universityOptions,
      ]
   )

   return (
      <CalendarContext.Provider value={contextValues}>
         <Box sx={styles.container}>
            <CalendarFilter
               showTitle={true}
               popoverProps={{
                  open: Boolean(anchorEl),
                  anchorEl: anchorEl,
                  onClose: () => setAnchorEl(null),
                  anchorOrigin: { horizontal: "right", vertical: "top" },
                  transformOrigin: { vertical: "top", horizontal: "right" },
                  keepMounted: false, // Does not mount the children when dialog is closed
               }}
            ></CalendarFilter>
            {isCalendarView ? (
               <CalendarChart
                  seriesData={seriesData}
                  setAnchorEl={setAnchorEl}
               ></CalendarChart>
            ) : (
               <CalendarLanding
                  selectedUniversities={selectedUniversities}
                  setIsCalendarView={setIsCalendarView}
               ></CalendarLanding>
            )}
         </Box>
      </CalendarContext.Provider>
   )
}

export default AcademicCalendar
