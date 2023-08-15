import {
   Accordion,
   AccordionDetails,
   AccordionSummary,
   Box,
   Button,
   Grid,
   Pagination,
   Paper,
   Stack,
   Typography,
} from "@mui/material"
import React, { useCallback, useMemo, useState } from "react"
import { sxStyles } from "types/commonTypes"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { Search as FindIcon } from "react-feather"
import { useTimelineUniversitiesByCountry } from "components/custom-hook/university-timeline/useTimelineUniversities"
import { TimelineUniversity } from "@careerfairy/shared-lib/universities/universityTimeline"
import { universityCountriesMap } from "components/util/constants/universityCountries"
import { PlusCircle as AddIcon, UploadCloud as UploadIcon } from "react-feather"
import TimelineUniversityInfo from "./TimelineUniversityInfo"
import { AcademicYearType } from "../utils"
import { UniversityTimelineInstance } from "data/firebase/UniversityTimelineService"
import UniversityIcon from "@mui/icons-material/AccountBalanceOutlined"
import EditUniversityDialog from "./EditUniversityDialog"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import { StyledTextField } from "components/views/group/admin/common/inputs"
import { ConfirmationDialogAction } from "materialUI/GlobalModals/ConfirmationDialog"

const styles = sxStyles({
   accordion: {
      borderRadius: "30px!important",
      boxShadow: "none",
      border: (theme) => `1px solid ${theme.palette.grey.main}`,
      backgroundColor: "#FFFFF",
   },
   summary: {
      fontSize: "18px",
   },
   button: {
      textTransform: "none",
      pl: "15px",
      pr: "15px",
      color: "tertiary.dark",
   },
   search: {
      borderRadius: "30px",
      borderColor: "grey.dark",
      ".MuiOutlinedInput-input": {
         pt: "15px",
         pb: "15px",
      },
      ".MuiOutlinedInput-root": {
         "& ::placeholder": {
            color: "tertiary.dark",
         },
      },
   },
   universitiesContainer: {
      mt: "10px",
   },
   pageContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      pt: "20px",
   },
   emptyContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      mt: "30px",
   },
   emptyButton: {
      textTransform: "none",
      ml: "15px",
      mr: "15px",
   },
   emptyText: { fontSize: "20px", color: "tertiary.dark", width: "300px" },
   emptyIcon: {
      fontSize: "60px",
      color: "tertiary.dark",
   },
})

const ITEM_PER_PAGE = 10

const isOptionEqualToValue = (
   option: TimelineUniversity,
   value: TimelineUniversity
) => option.id === value.id

const getOptionLabel = (option: TimelineUniversity) => option.name

type Props = {
   countryCode: string
   academicYear: AcademicYearType
}

const TimelineCountryAccordion = ({ countryCode, academicYear }: Props) => {
   const timelineService = UniversityTimelineInstance
   const { data: universities } = useTimelineUniversitiesByCountry(
      countryCode ? countryCode : ""
   )
   const [searchInputValue, setSearchInputValue] = useState("")
   const [isAddDialogOpen, handleOpenAddDialog, handleCloseAddDialog] =
      useDialogStateHandler()

   const searchedUniversities = useMemo(
      () =>
         universities?.filter((university) =>
            university.name
               .toLowerCase()
               .includes(searchInputValue.toLowerCase())
         ),
      [searchInputValue, universities]
   )

   const handleBatchUploadError = useCallback((error: Error) => {}, [])

   const handleBatchUpload = useCallback(
      (event) => {
         timelineService.handleAddBatchPeriods(
            event,
            countryCode,
            handleBatchUploadError
         )
      },
      [countryCode, handleBatchUploadError, timelineService]
   )

   const handleDownloadTemplate = useCallback(() => {
      timelineService.handleDownloadBatchPeriodsTemplate()
   }, [timelineService])

   return (
      <Box>
         <Accordion sx={styles.accordion}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
               <Typography sx={styles.summary}>
                  {universityCountriesMap[countryCode]}
               </Typography>
            </AccordionSummary>
            <AccordionDetails>
               <Grid container spacing={2}>
                  <Grid item xs={6}>
                     <Paper variant={"outlined"} sx={styles.search}>
                        <StyledTextField
                           fullWidth
                           placeholder={"Search for a university"}
                           InputProps={{
                              endAdornment: (
                                 <Box sx={{ mr: "10px", mt: "5px" }}>
                                    <FindIcon />
                                 </Box>
                              ),
                           }}
                           value={searchInputValue}
                           onChange={(
                              event: React.ChangeEvent<HTMLInputElement>
                           ) => {
                              setSearchInputValue(event.target.value)
                           }}
                        />
                     </Paper>
                  </Grid>
                  <Grid item xs>
                     <Button
                        variant={"outlined"}
                        component={"label"}
                        sx={styles.button}
                        color={"grey"}
                        endIcon={<UploadIcon />}
                     >
                        <input
                           hidden
                           type="file"
                           accept=".xlsx"
                           onChange={handleBatchUpload}
                        />
                        Batch upload
                     </Button>
                  </Grid>
                  <Grid item xs>
                     <Button
                        onClick={handleOpenAddDialog}
                        variant={"outlined"}
                        sx={styles.button}
                        color={"grey"}
                        endIcon={<AddIcon />}
                     >
                        Add new university
                     </Button>
                  </Grid>
               </Grid>
               {universities?.length ? (
                  <TimelineUniversitiesList
                     universities={searchedUniversities}
                  />
               ) : (
                  <EmptyTimelineUniversitiesList
                     handleBatchUpload={handleBatchUpload}
                     handleDownloadTemplate={handleDownloadTemplate}
                  />
               )}
            </AccordionDetails>
         </Accordion>
         <EditUniversityDialog
            countryCode={countryCode}
            isEditDialogOpen={isAddDialogOpen}
            handleCloseEditDialog={handleCloseAddDialog}
         ></EditUniversityDialog>
      </Box>
   )
}

type ListProps = {
   universities: TimelineUniversity[]
}

const TimelineUniversitiesList = ({ universities }: ListProps) => {
   const [currentPage, setCurrentPage] = useState(1)
   const currentPageUniversities = useMemo(
      () =>
         universities?.slice(
            (currentPage - 1) * ITEM_PER_PAGE,
            (currentPage - 1) * ITEM_PER_PAGE + ITEM_PER_PAGE
         ),
      [currentPage, universities]
   )

   return (
      <>
         <Stack sx={styles.universitiesContainer} spacing={2}>
            {currentPageUniversities?.map((university) => (
               <TimelineUniversityInfo
                  key={university.id}
                  university={university}
               />
            ))}
         </Stack>
         <Box sx={styles.pageContainer}>
            <Pagination
               shape={"rounded"}
               color={"secondary"}
               hideNextButton
               hidePrevButton
               count={Math.ceil(universities?.length / ITEM_PER_PAGE)}
               page={currentPage}
               onChange={(event, value) => setCurrentPage(value)}
            />
         </Box>
      </>
   )
}

type EmptyListProps = {
   handleBatchUpload: (event: any) => void
   handleDownloadTemplate: () => void
}

const EmptyTimelineUniversitiesList = ({
   handleBatchUpload,
   handleDownloadTemplate,
}: EmptyListProps) => {
   return (
      <Stack spacing={2} sx={styles.emptyContainer}>
         <UniversityIcon sx={styles.emptyIcon} />
         <Typography sx={styles.emptyText}>
            No universities were added to this country yet
         </Typography>
         <Box>
            <Button
               variant={"outlined"}
               sx={styles.emptyButton}
               color={"secondary"}
               onClick={handleDownloadTemplate}
            >
               Download template
            </Button>
            <Button
               sx={styles.emptyButton}
               component={"label"}
               variant={"contained"}
               color={"secondary"}
               endIcon={<UploadIcon />}
            >
               <input
                  hidden
                  type="file"
                  accept=".xlsx"
                  onChange={handleBatchUpload}
               />
               Batch Upload
            </Button>
         </Box>
      </Stack>
   )
}

export default TimelineCountryAccordion
