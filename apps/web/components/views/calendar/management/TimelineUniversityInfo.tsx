import { Button, Grid, Paper, Typography } from "@mui/material"
import React, { useCallback, useContext, useMemo } from "react"
import { sxStyles } from "types/commonTypes"
import {
   TimelineUniversity,
   UniversityPeriodType,
} from "@careerfairy/shared-lib/universities/universityTimeline"
import { Edit as EditIcon } from "react-feather"
import { useUniversityPeriodsByIds } from "components/custom-hook/university-timeline/useUniversityPeriods"
import { DateTimeFormatOptions } from "luxon"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import EditUniversityDialog from "./EditUniversityDialog"
import { CalendarManagerContext } from "./TimelineCountriesManager"

const styles = sxStyles({
   container: {
      padding: "10px",
      textAlign: "left",
      borderRadius: "10px",
      backgroundColor: "#FDFDFD",
   },
   title: {
      fontWeight: 500,
      mb: "5px",
   },
   period: { fontSize: "14px" },
   edit: { textAlign: "end" },
   editButton: { p: 1, m: 0, minWidth: 0 },
})

type Props = {
   university: TimelineUniversity
}

const TimelineUniversityInfo = ({ university }: Props) => {
   const [isEditDialogOpen, handleOpenEditDialog, handleCloseEditDialog] =
      useDialogStateHandler()

   // get and filter periods not in academic year (2 steps because of firebase not supporting inequalities on > 1 fields)
   const { academicYear, academicYears } = useContext(CalendarManagerContext)
   const universityPeriodsUnsorted = useUniversityPeriodsByIds([university.id])

   const universityPeriods = useMemo(
      () =>
         universityPeriodsUnsorted.data?.sort((period1, period2) =>
            period1.start <= period2.start ? -1 : 1
         ),
      [universityPeriodsUnsorted.data]
   )
   const selectedYearPeriods = useMemo(
      () =>
         universityPeriods?.filter(
            (period) =>
               period.start.toDate() <= academicYears[academicYear].end &&
               period.end.toDate() >= academicYears[academicYear].start
         ),
      [academicYear, academicYears, universityPeriods]
   )

   const getPeriodsTypography = useCallback(
      (type: UniversityPeriodType) => {
         const filteredPeriods = selectedYearPeriods?.filter(
            (period) => period.type === type
         )

         return filteredPeriods?.length ? (
            filteredPeriods.map((period) => {
               const start = period.start
                  .toDate()
                  .toLocaleString("en-UK", dateOptions)
               const end = period.end
                  .toDate()
                  .toLocaleString("en-UK", dateOptions)
               return (
                  <Typography key={period.id} sx={styles.period}>
                     {start + " - " + end}
                  </Typography>
               )
            })
         ) : (
            <Typography sx={styles.period}>N/A</Typography>
         )
      },
      [selectedYearPeriods]
   )

   return (
      <>
         <Paper sx={styles.container} variant={"outlined"}>
            <Grid container spacing={1}>
               <Grid item xs={4}>
                  <Typography sx={styles.title}>{university.name}</Typography>
               </Grid>
               <Grid item xs>
                  <Typography sx={styles.title}>Lectures</Typography>
                  {getPeriodsTypography("lecture")}
               </Grid>
               <Grid item xs>
                  <Typography sx={styles.title}>Exams</Typography>
                  {getPeriodsTypography("exam")}
               </Grid>
               <Grid item xs>
                  <Typography sx={styles.title}>Vacations</Typography>
                  {getPeriodsTypography("vacation")}
               </Grid>
               <Grid item xs={"auto"} sx={styles.edit}>
                  <Button
                     sx={styles.editButton}
                     color={"black"}
                     onClick={handleOpenEditDialog}
                  >
                     <EditIcon size={"16px"} />
                  </Button>
               </Grid>
            </Grid>
         </Paper>
         <EditUniversityDialog
            university={university}
            countryCode={university.countryCode}
            periods={universityPeriods}
            isEditDialogOpen={isEditDialogOpen}
            handleCloseEditDialog={handleCloseEditDialog}
         />
      </>
   )
}

const dateOptions = {
   year: "2-digit",
   month: "short",
   day: "2-digit",
} as DateTimeFormatOptions

export default TimelineUniversityInfo
