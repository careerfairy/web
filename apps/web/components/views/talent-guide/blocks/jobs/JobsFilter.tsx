import { BusinessFunctionsTagValues } from "@careerfairy/shared-lib/constants/tags"
import { jobTypeOptions } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Button, Stack, Typography } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import { ResponsiveDialogLayout } from "components/views/common/ResponsiveDialog"
import { BrandedCheckboxListItem } from "components/views/common/inputs/BrandedCheckbox"
import CircularLoader from "components/views/loader/CircularLoader"
import { ChevronDown } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useJobsBlock } from "./control/JobsBlockContext"

const styles = sxStyles({
   filterButton: (theme) => ({
      display: "flex",
      padding: "6px 12px",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "18px",
      border: `1px solid ${theme.palette.neutral[200]}`,
      background: theme.brand.white[200],
      color: theme.palette.neutral[600],
      "&:hover": {
         borderColor: theme.palette.neutral[400],
      },
   }),
   dialogTitle: {
      fontWeight: 600,
   },
   checkboxWrapper: {
      px: {
         sm: 0,
         md: 3,
      },
   },
})

export const JobsFilter = () => {
   const [isJobAreasDialogOpen, handleOpenJobAreas, handleCloseJobAreas] =
      useDialogStateHandler()
   const [isJobTypesDialogOpen, handleOpenJobTypes, handleCloseJobTypes] =
      useDialogStateHandler()
   const { selectedJobAreasIds, selectedJobTypesIds } = useJobsBlock()
   return (
      <>
         <Stack direction="row" spacing={1} mb={1.5}>
            <Button
               variant="outlined"
               sx={styles.filterButton}
               endIcon={<ChevronDown />}
               onClick={handleOpenJobAreas}
            >
               <Typography variant="small" lineHeight={"20px"}>
                  Job fields
                  {selectedJobAreasIds.length > 0 && (
                     <Typography
                        variant="small"
                        lineHeight={"20px"}
                        fontWeight={600}
                     >
                        {` (${selectedJobAreasIds.length})`}
                     </Typography>
                  )}
               </Typography>
            </Button>
            <Button
               variant="outlined"
               sx={styles.filterButton}
               endIcon={<ChevronDown />}
               onClick={handleOpenJobTypes}
            >
               <Typography variant="small" lineHeight={"20px"}>
                  Job Type
                  {selectedJobTypesIds.length > 0 && (
                     <Typography
                        variant="small"
                        lineHeight={"20px"}
                        fontWeight={600}
                     >
                        {` (${selectedJobTypesIds.length})`}
                     </Typography>
                  )}
               </Typography>
            </Button>
         </Stack>
         <JobAreasDialog
            isOpen={isJobAreasDialogOpen}
            handleClose={handleCloseJobAreas}
         />
         <JobTypesDialog
            isOpen={isJobTypesDialogOpen}
            handleClose={handleCloseJobTypes}
         />
      </>
   )
}

type FilterDialogProps = {
   isOpen: boolean
   handleClose: () => void
}

const JobAreasDialog = ({ isOpen, handleClose }: FilterDialogProps) => {
   const { selectedJobAreasIds, handleSelectJobArea } = useJobsBlock()

   return (
      <ResponsiveDialogLayout open={isOpen} handleClose={handleClose}>
         <ResponsiveDialogLayout.Header handleClose={handleClose}>
            <Typography sx={styles.dialogTitle} variant="medium">
               Job fields
            </Typography>
         </ResponsiveDialogLayout.Header>
         <ResponsiveDialogLayout.Content>
            <SuspenseWithBoundary fallback={<CircularLoader />}>
               <Stack>
                  {BusinessFunctionsTagValues.map((tag) => (
                     <BrandedCheckboxListItem
                        key={tag.id}
                        value={tag}
                        checked={selectedJobAreasIds.includes(tag.id)}
                        handleClick={handleSelectJobArea}
                        wrapperSx={styles.checkboxWrapper}
                     />
                  ))}
               </Stack>
            </SuspenseWithBoundary>
         </ResponsiveDialogLayout.Content>
      </ResponsiveDialogLayout>
   )
}

const JobTypesDialog = ({ isOpen, handleClose }: FilterDialogProps) => {
   const { selectedJobTypesIds, handleSelectJobType } = useJobsBlock()

   return (
      <ResponsiveDialogLayout open={isOpen} handleClose={handleClose}>
         <ResponsiveDialogLayout.Header handleClose={handleClose}>
            <Typography sx={styles.dialogTitle} variant="medium">
               Job Types
            </Typography>
         </ResponsiveDialogLayout.Header>
         <ResponsiveDialogLayout.Content>
            <SuspenseWithBoundary fallback={<CircularLoader />}>
               <Stack>
                  {jobTypeOptions.map(({ id, label }) => (
                     <BrandedCheckboxListItem
                        key={id}
                        value={{ id: id, name: label }}
                        checked={selectedJobTypesIds.includes(id)}
                        handleClick={handleSelectJobType}
                        wrapperSx={styles.checkboxWrapper}
                     />
                  ))}
               </Stack>
            </SuspenseWithBoundary>
         </ResponsiveDialogLayout.Content>
      </ResponsiveDialogLayout>
   )
}
