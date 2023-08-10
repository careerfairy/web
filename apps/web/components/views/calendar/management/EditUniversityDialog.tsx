import React, { useCallback, useContext, useMemo, useState } from "react"
import { sxStyles } from "types/commonTypes"
import {
   Box,
   Button,
   Dialog,
   DialogContent,
   DialogTitle,
   Grid,
   IconButton,
   Paper,
   Stack,
   Typography,
} from "@mui/material"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import {
   TimelineUniversity,
   UniversityPeriod,
   UniversityPeriodObject,
} from "@careerfairy/shared-lib/universities/universityTimeline"
import PeriodDatesPicker from "./PeriodDatesPicker"
import { SlideUpTransition } from "components/views/common/transitions"
import CloseIcon from "@mui/icons-material/Close"
import AcademicYearSelector from "./AcademicYearSelector"
import { CalendarManagerContext } from "./TimelineCountriesManager"
import { isPeriodInInterval } from "../utils"
import ContentButton from "components/views/portal/content-carousel/ContentButton"
import { UniversityTimelineInstance } from "data/firebase/UniversityTimelineService"
import { getDoc } from "firebase/firestore"
import { universityCountriesMap } from "components/util/constants/universityCountries"
import { Trash as TrashIcon } from "react-feather"
import ConfirmationDialog, {
   ConfirmationDialogAction,
} from "materialUI/GlobalModals/ConfirmationDialog"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import UniversityIcon from "@mui/icons-material/AccountBalanceOutlined"

const styles = sxStyles({
   dialogRoot: {
      "& .MuiPaper-root": {
         overflowY: "visible",
      },
   },
   content: {
      p: { xs: 1, md: 2 },
      minWidth: 200,
   },
   header: {
      px: { xs: 2, md: 4 },
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
   },
   actions: {
      px: { xs: 2, md: 4 },
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
   },
   datesContainer: { p: "10px", mt: "20px" },
   periodNames: {
      color: "tertiary.dark",
      mt: "10px",
   },
   outerButtonsContainer: { display: "flex", justifyContent: "space-between" },
   innerButtonsContainer: { display: "flex", justifyContent: "flex-end" },
   button: {
      fontWeight: 300,
      textTransform: "none",
      pt: "5px",
      pb: "5px",
      pr: "20px",
      pl: "20px",
      m: "10px",
   },
   deleteIcon: {
      "& svg": {
         fontSize: "150px",
         color: "#505050",
      },
   },
})

type Props = {
   isEditDialogOpen: boolean
   handleCloseEditDialog: () => void
   countryCode: string
   university?: TimelineUniversity // to add to edit an existing university
   periods?: UniversityPeriod[] // to add when editing an existing university
}

const EditUniversityDialog = ({
   isEditDialogOpen,
   handleCloseEditDialog,
   countryCode,
   university,
   periods,
}: Props) => {
   const timelineService = UniversityTimelineInstance
   const { academicYear, academicYears } = useContext(CalendarManagerContext)
   const [universityName, setUniversityName] = useState<string>(
      university?.name
   )
   const [modifiedPeriods, setModifiedPeriods] = useState<UniversityPeriod[]>(
      []
   )
   const [deletedPeriodIds, setDeletedPeriodIds] = useState<string[]>([])
   const [isDeleteDialogOpen, handleOpenDeleteDialog, handleCloseDeleteDialog] =
      useDialogStateHandler()

   const resetState = useCallback(() => {
      setUniversityName(university?.name)
      setModifiedPeriods([])
      setDeletedPeriodIds([])
      handleCloseEditDialog()
   }, [handleCloseEditDialog, university?.name])

   const handleCancelButton = useCallback(() => {
      resetState()
   }, [resetState])

   const handleConfirmButton = useCallback(async () => {
      resetState()
      let universityId
      if (university) {
         // if the university already existed
         timelineService.updateTimelineUniversity(university.id, {
            name: universityName,
         })
         universityId = university.id
      } else {
         // if it is a new university
         const universityRef = await timelineService.addTimelineUniversity({
            name: universityName,
            countryCode: countryCode,
         })
         const universityDoc = await getDoc(universityRef)
         universityId = universityDoc.id
      }
      modifiedPeriods.forEach((period) => {
         period.timelineUniversityId = universityId
         if (!period.id) {
            timelineService.addUniversityPeriod(universityId, period)
         } else {
            timelineService.updateUniversityPeriod(
               universityId,
               period.id,
               period
            )
         }
      })
      deletedPeriodIds.forEach((periodId) => {
         timelineService.removeUniversityPeriod(universityId, periodId)
      })
   }, [
      countryCode,
      deletedPeriodIds,
      modifiedPeriods,
      resetState,
      timelineService,
      university,
      universityName,
   ])

   const renderPeriods = useCallback(
      (periodsToRender: UniversityPeriod[], periodType) => {
         return periodsToRender
            ?.filter((period) => period.type == periodType)
            .filter((period) => !deletedPeriodIds.includes(period.id))
            .filter((period) =>
               isPeriodInInterval(
                  period,
                  academicYears[academicYear].start,
                  academicYears[academicYear].end
               )
            )
            .map((period) => (
               <PeriodDatesPicker
                  key={period.id}
                  type={periodType}
                  period={period}
                  university={university}
                  modifiedPeriods={modifiedPeriods}
                  setModifiedPeriods={setModifiedPeriods}
                  setDeletedPeriodIds={setDeletedPeriodIds}
               />
            ))
      },
      [
         academicYear,
         academicYears,
         deletedPeriodIds,
         modifiedPeriods,
         university,
      ]
   )

   const renderOriginalPeriods = useCallback(
      (periodType) => renderPeriods(periods, periodType),
      [periods, renderPeriods]
   )

   const renderNewPeriods = useCallback(
      (periodType) => {
         return renderPeriods(
            modifiedPeriods.filter((period) => !period.id),
            periodType
         )
      },
      [modifiedPeriods, renderPeriods]
   )

   return (
      <>
         <Dialog
            sx={styles.dialogRoot}
            open={isEditDialogOpen}
            onClose={handleCloseEditDialog}
            maxWidth={"md"}
            fullWidth
            TransitionComponent={SlideUpTransition}
            keepMounted={false}
         >
            <DialogTitle sx={styles.header}>
               <Typography fontWeight={600} fontSize={"24px"}>
                  {university
                     ? "Edit university"
                     : "Add a university in " +
                       universityCountriesMap[countryCode]}
               </Typography>
               <IconButton onClick={handleCancelButton}>
                  <CloseIcon
                     fontSize="large"
                     color={"inherit"}
                     sx={{ color: "text.primary" }}
                  />
               </IconButton>
            </DialogTitle>

            <DialogContent sx={styles.content}>
               <BrandedTextField
                  fullWidth
                  label={"University Name"}
                  placeholder={"Insert university name"}
                  value={universityName}
                  onChange={(event) => {
                     setUniversityName(event.target.value)
                  }}
               ></BrandedTextField>
               <Paper sx={styles.datesContainer} variant={"outlined"}>
                  <AcademicYearSelector />
                  <Grid container spacing={2}>
                     {Object.values(UniversityPeriodObject).map(
                        (periodType) => (
                           <Grid key={periodType} item xs={4}>
                              <Typography sx={styles.periodNames}>
                                 {periodType.charAt(0).toUpperCase() +
                                    periodType.slice(1) +
                                    " dates"}
                              </Typography>
                              <Stack>
                                 {renderOriginalPeriods(periodType)}
                                 {renderNewPeriods(periodType)}
                                 <PeriodDatesPicker
                                    type={periodType}
                                    university={university}
                                    modifiedPeriods={modifiedPeriods}
                                    setModifiedPeriods={setModifiedPeriods}
                                    setDeletedPeriodIds={setDeletedPeriodIds}
                                 />
                              </Stack>
                           </Grid>
                        )
                     )}
                  </Grid>
               </Paper>
               <Box sx={styles.outerButtonsContainer}>
                  {university ? (
                     <Button
                        variant={"outlined"}
                        sx={styles.button}
                        color={"error"}
                        onClick={handleOpenDeleteDialog}
                        endIcon={<TrashIcon />}
                     >
                        Delete University
                     </Button>
                  ) : null}
                  <Box sx={styles.innerButtonsContainer}>
                     <Button
                        variant={"outlined"}
                        sx={styles.button}
                        color={"black"}
                        onClick={handleCancelButton}
                     >
                        Cancel
                     </Button>
                     <ContentButton
                        sx={styles.button}
                        color={"secondary"}
                        onClick={handleConfirmButton}
                        disabled={!universityName || universityName == ""}
                     >
                        {university ? "Save changes" : "Add university"}
                     </ContentButton>
                  </Box>
               </Box>
            </DialogContent>
         </Dialog>
         <ConfirmDeleteUniversityDialog
            university={university}
            resetState={resetState}
            handleCloseDialog={handleCloseDeleteDialog}
            isDialogOpen={isDeleteDialogOpen}
         />
      </>
   )
}

type DeleteUniversityProps = {
   university: TimelineUniversity
   resetState: () => void
   handleCloseDialog: () => void
   isDialogOpen: boolean
}

const ConfirmDeleteUniversityDialog = ({
   university,
   resetState,
   handleCloseDialog,
   isDialogOpen,
}: DeleteUniversityProps) => {
   const timelineService = UniversityTimelineInstance

   const handleDeleteUniversity = useCallback(() => {
      resetState()
      timelineService.removeTimelineUniversity(university.id)
   }, [resetState, timelineService, university])

   const deleteAction = useMemo<ConfirmationDialogAction>(
      () => ({
         callback: () => {
            handleDeleteUniversity()
            handleCloseDialog()
         },
         text: "Yes, Delete",
         color: "error",
         variant: "contained",
      }),
      [handleCloseDialog, handleDeleteUniversity]
   )

   const cancelAction = useMemo<ConfirmationDialogAction>(
      () => ({
         callback: () => {
            handleCloseDialog()
         },
         text: "Go Back",
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
            <Box sx={styles.deleteIcon}>
               <UniversityIcon />
            </Box>
         }
         title="Are you sure you want to delete this university?"
         description={
            <Typography>
               You wont be able to recover this university or any data related
               to it
            </Typography>
         }
         primaryAction={deleteAction}
         secondaryAction={cancelAction}
      />
   )
}

export default EditUniversityDialog
