import {
   TimelineUniversity,
   UniversityPeriod,
   UniversityPeriodType,
} from "@careerfairy/shared-lib/universities/universityTimeline"
import React, { useCallback, useMemo, useRef, useState } from "react"
import { lighten, useTheme } from "@mui/material/styles"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import { Calendar as CalendarIcon, PlusCircle as PlusIcon } from "react-feather"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { sxStyles } from "types/commonTypes"
import { Box, Button, Typography } from "@mui/material"
import { useCalendarManager } from "./TimelineCountriesManager"
import { Timestamp } from "firebase/firestore"
import ConfirmationDialog, {
   ConfirmationDialogAction,
} from "materialUI/GlobalModals/ConfirmationDialog"
import { UniversityTimelineInstance } from "data/firebase/UniversityTimelineService"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import DeleteCalendarIcon from "@mui/icons-material/EventBusy"
import GBLocale from "date-fns/locale/en-GB"

const styles = sxStyles({
   datePicker: {
      mt: "10px",
      "& .react-datepicker": {
         fontFamily: (theme) => theme.typography.fontFamily + "!important",
      },
      "& .react-datepicker__header": {
         backgroundColor: "white",
         borderBlockColor: "transparent",
         pb: 0,
      },
      "& .react-datepicker__navigation-icon::before": {
         borderColor: "secondary.main",
      },
      "& .react-datepicker__day-names": {
         mt: "10px",
         fontWeight: 600,
      },
      "& .react-datepicker__day--selected": {
         backgroundColor: "secondary.main",
         borderRadius: "20px",
      },
      "& .react-datepicker__day--in-range": {
         backgroundColor: (theme) =>
            theme.palette.secondary.main + "!important",
         color: "white!important",
         borderRadius: "20px",
      },
      "& .react-datepicker__day--in-selecting-range": {
         backgroundColor: (theme) =>
            lighten(theme.palette.secondary.main, 0.4) + "!important",
         borderRadius: "20px",
      },
      "& .react-datepicker__day:hover": {
         backgroundColor: (theme) => lighten(theme.palette.secondary.main, 0.4),
         borderRadius: "20px",
      },
      "& .react-datepicker__day--keyboard-selected": {
         backgroundColor: "transparent",
      },
   },
   buttonsContainer: {
      pt: "10px",
   },
   button: {
      fontSize: "10px",
      fontWeight: 300,
      textTransform: "none",
      p: "5px",
      pl: "10px",
      pr: "10px",
   },
   buttonRight: {
      ml: "38px",
   },
   calendarIcon: {
      "& svg": {
         mt: "50px",
         mb: "0px",
         fontSize: "150px",
         color: "#505050",
      },
   },
})

type Props = {
   type: UniversityPeriodType
   period?: UniversityPeriod
   university?: TimelineUniversity
   modifiedPeriods: UniversityPeriod[]
   setModifiedPeriods: React.Dispatch<React.SetStateAction<UniversityPeriod[]>>
   setDeletedPeriodIds: React.Dispatch<React.SetStateAction<string[]>>
}

const PeriodDatesPicker = ({
   type,
   period,
   university,
   modifiedPeriods,
   setModifiedPeriods,
   setDeletedPeriodIds,
}: Props) => {
   const theme = useTheme()
   const { academicYear, academicYears } = useCalendarManager()
   const [startDate, setStartDate] = useState(
      period ? period.start.toDate() : null
   )
   const [endDate, setEndDate] = useState(period ? period.end.toDate() : null)
   const [modified, setModified] = useState(false)
   const [isDeleteDialogOpen, handleOpenDeleteDialog, handleCloseDeleteDialog] =
      useDialogStateHandler()
   const datePickerRef = useRef(null)

   const onDateChange = useCallback((dates) => {
      const [start, end] = dates
      setStartDate(start)
      setEndDate(end)
      setModified(true)
   }, [])

   const handleCancelButton = useCallback(() => {
      datePickerRef.current.setOpen(false)
      setModified(false)
      if (!period) {
         // if we were inserting a period
         setStartDate(null)
         setEndDate(null)
      } else {
         // if we were modifying a period
         const index = modifiedPeriods.findIndex(
            (modified) => modified.id == period.id
         )
         if (!period.id || index < 0) {
            // if the period did not originally exist, or was never modified
            setStartDate(period.start.toDate())
            setEndDate(period.end.toDate())
         } else {
            // if the period was modified before
            setStartDate(modifiedPeriods[index].start.toDate())
            setEndDate(modifiedPeriods[index].end.toDate())
         }
      }
   }, [modifiedPeriods, period])

   const handleSelectButton = useCallback(() => {
      // close the date picker
      datePickerRef.current.setOpen(false)
      setModified(false)
      if (period) {
         // if we modify a period
         setModifiedPeriods((modifiedPeriods) => {
            const modifiedIndex = modifiedPeriods.findIndex(
               (modified) => modified.id == period.id
            )
            if (modifiedIndex >= 0) {
               // if it had been modified before
               modifiedPeriods[modifiedIndex].start =
                  Timestamp.fromDate(startDate)
               modifiedPeriods[modifiedIndex].end = Timestamp.fromDate(endDate)
               return [...modifiedPeriods]
            } else {
               // if it is the first time it is being modified
               const newModifiedPeriod: UniversityPeriod = {
                  id: period.id,
                  timelineUniversityId: university ? university.id : null,
                  type: type,
                  start: Timestamp.fromDate(startDate),
                  end: Timestamp.fromDate(endDate),
               }
               return [...modifiedPeriods, newModifiedPeriod]
            }
         })
      } else {
         // if we insert a new period
         setModifiedPeriods((modifiedPeriods) => {
            const newPeriod: UniversityPeriod = {
               id: null,
               timelineUniversityId: university ? university.id : null,
               type: type,
               start: Timestamp.fromDate(startDate),
               end: Timestamp.fromDate(endDate),
            }
            setStartDate(null)
            setEndDate(null)
            return [...modifiedPeriods, newPeriod]
         })
      }
   }, [endDate, period, setModifiedPeriods, startDate, type, university])

   const handleDeleteButton = useCallback(() => {
      if (period.id) {
         setDeletedPeriodIds((deleted) => [...deleted, period.id])
      } else {
         setModifiedPeriods((modifiedPeriods) => [
            ...modifiedPeriods.filter(
               (modifiedPeriod) =>
                  modifiedPeriod.start != period.start ||
                  modifiedPeriod.end != period.end
            ),
         ])
      }
   }, [period, setDeletedPeriodIds, setModifiedPeriods])

   return (
      <Box sx={styles.datePicker}>
         <DatePicker
            ref={datePickerRef}
            selected={startDate}
            onChange={onDateChange}
            startDate={startDate}
            endDate={endDate}
            minDate={academicYears[academicYear].start}
            maxDate={academicYears[academicYear].end}
            dateFormat={"dd MMM yy"}
            locale={GBLocale}
            formatWeekDay={(nameOfDay) => nameOfDay.substr(0, 1)}
            placeholderText="Insert dates"
            shouldCloseOnSelect={false}
            selectsRange
            customInput={
               <BrandedTextField
                  fullWidth
                  inputProps={{ sx: { pt: "10px" } }}
                  InputProps={{
                     endAdornment: period ? (
                        <CalendarIcon color={theme.palette.secondary.main} />
                     ) : (
                        <PlusIcon color={theme.palette.grey.dark} />
                     ),
                     disableUnderline: true,
                     readOnly: true,
                  }}
               />
            }
         >
            <Box sx={styles.buttonsContainer}>
               {modified || !period ? (
                  <Button
                     sx={styles.button}
                     color={"black"}
                     onClick={handleCancelButton}
                  >
                     Cancel
                  </Button>
               ) : (
                  <Button
                     sx={styles.button}
                     variant={"outlined"}
                     color={"error"}
                     onClick={handleOpenDeleteDialog}
                  >
                     Delete
                  </Button>
               )}
               <Button
                  sx={[styles.button, styles.buttonRight]}
                  variant={"contained"}
                  color={"secondary"}
                  onClick={handleSelectButton}
                  disabled={!modified || !endDate}
               >
                  Select dates
               </Button>
            </Box>
         </DatePicker>
         <ConfirmDeletePeriodDialog
            university={university}
            period={period}
            handleCloseDialog={handleCloseDeleteDialog}
            isDialogOpen={isDeleteDialogOpen}
            handleDeletePeriod={handleDeleteButton}
         />
      </Box>
   )
}

type DeletePeriodProps = {
   university: TimelineUniversity
   period: UniversityPeriod
   handleCloseDialog: () => void
   handleDeletePeriod: () => void
   isDialogOpen: boolean
}

const ConfirmDeletePeriodDialog = ({
   university,
   period,
   handleCloseDialog,
   handleDeletePeriod,
   isDialogOpen,
}: DeletePeriodProps) => {
   const timelineService = UniversityTimelineInstance

   const deleteAction = useMemo<ConfirmationDialogAction>(
      () => ({
         callback: () => {
            handleCloseDialog()
            handleDeletePeriod()
         },
         text: "Yes, delete",
         color: "error",
         variant: "contained",
      }),
      [handleCloseDialog, handleDeletePeriod]
   )

   const cancelAction = useMemo<ConfirmationDialogAction>(
      () => ({
         callback: () => {
            handleCloseDialog()
         },
         text: "Go back",
         color: "black",
         variant: "outlined",
      }),
      [handleCloseDialog]
   )
   return (
      <ConfirmationDialog
         open={isDialogOpen}
         handleClose={handleCloseDialog}
         icon={
            <Box sx={styles.calendarIcon}>
               <DeleteCalendarIcon />
            </Box>
         }
         title={null}
         description={
            <Typography
               sx={{
                  fontWeight: 500,
                  fontSize: "25px",
                  color: "black.main",
                  mt: 0,
               }}
            >
               Are you sure you want to delete this period?
            </Typography>
         }
         primaryAction={deleteAction}
         secondaryAction={cancelAction}
      />
   )
}

export default PeriodDatesPicker
