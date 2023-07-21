import React, { useMemo, useState } from "react"
import { useUniversityPeriodsByIdsAndStart } from "components/custom-hook/university-timeline/useUniversityPeriods"
import { useTimelineUniversities } from "components/custom-hook/university-timeline/useTimelineUniversities"
import { UniversityPeriodObject } from "@careerfairy/shared-lib/universities/universityTimeline"
import CalendarFilter from "components/views/calendar/CalendarFilter"
import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import CalendarLanding from "./CalendarLanding"
import CalendarChart from "./CalendarChart"
import { Box } from "@mui/material"

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
         currentDate.getMonth() <= 8
            ? new Date(currentDate.getFullYear() - 1, 1, 1)
            : new Date(currentDate.getFullYear() - 1, 8, 1),
      [currentDate]
   )

   const end = useMemo(
      () =>
         currentDate.getMonth() <= 8
            ? new Date(currentDate.getFullYear() + 1, 1, 1)
            : new Date(currentDate.getFullYear() + 1, 8, 1),
      [currentDate]
   )

   // need to filter timeframe in 2 steps since firestore does not support inequalities on several fields
   let { data: periods } = useUniversityPeriodsByIdsAndStart(
      allUniversityOptions?.map((uni) => uni.id),
      start
   )

   periods = useMemo(
      () =>
         periods ? periods.filter((period) => period.end.toDate() <= end) : [],
      [end, periods]
   )

   // update to only include those that have periods in the timeframe
   allUniversityOptions = useMemo(
      () =>
         allUniversityOptions
            ? allUniversityOptions.filter((uni) =>
                 periods
                    .map((period) => period.timelineUniversityId)
                    .includes(uni.id)
              )
            : [],
      [periods, allUniversityOptions]
   )

   // update to only include those in the current selection
   const selectedPeriods = useMemo(
      () =>
         periods.filter((period) =>
            selectedUniversities
               .map((sel) => sel.id)
               .includes(period.timelineUniversityId)
         ),
      [periods, selectedUniversities]
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
         if (selectedPeriods) {
            dataArray = selectedPeriods
               .filter((period) => period.type == type)
               .map(function (period) {
                  return {
                     x: selectedUniversities.find(
                        (uni) => uni.id == period.timelineUniversityId
                     )?.name,
                     y: [period.start.toMillis(), period.end.toMillis()],
                  }
               })
         }
         seriesData.push({
            name: type.charAt(0).toUpperCase() + type.slice(1),
            data: dataArray,
         })
      })
      return seriesData
   }, [selectedPeriods, selectedUniversities])

   return (
      <Box height="100%">
         <CalendarFilter
            allUniversityOptions={allUniversityOptions}
            selectedUniversities={selectedUniversities}
            setSelectedUniversities={setSelectedUniversities}
            selectedCountries={selectedCountries}
            setSelectedCountries={setSelectedCountries}
            universityOptions={universityOptions}
            setUniversityOptions={setUniversityOptions}
            showTitle={true}
            isSingleColumnChecklist={true}
            popoverProps={{
               open: Boolean(anchorEl),
               anchorEl: anchorEl,
               onClose: () => setAnchorEl(null),
               anchorOrigin: { horizontal: "right", vertical: "top" },
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
               allUniversityOptions={allUniversityOptions}
               selectedUniversities={selectedUniversities}
               setSelectedUniversities={setSelectedUniversities}
               selectedCountries={selectedCountries}
               setSelectedCountries={setSelectedCountries}
               universityOptions={universityOptions}
               setUniversityOptions={setUniversityOptions}
               setIsCalendarView={setIsCalendarView}
            ></CalendarLanding>
         )}
      </Box>
   )
}

export default AcademicCalendar
