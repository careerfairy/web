import { Grid, Stack } from "@mui/material"
import useGroupCustomJobs from "components/custom-hook/custom-job/useGroupCustomJobs"
import { FC, useCallback, useMemo } from "react"
import { useLivestreamFormValues } from "../../../useLivestreamFormValues"
import {
   PublicCustomJob,
   pickPublicDataFromCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import SelectorCustomJobsDropDown from "./components/SelectorCustomJobsDropDown"
import EmptyJobs from "../components/EmptyJobs"
import JobList from "../components/JobList"
import JobFormDialog from "components/views/group/admin/jobs/dialog/JobFormDialog"
import { useDispatch, useSelector } from "react-redux"
import { jobsDialogOpenSelector } from "store/selectors/adminJobsSelectors"
import { closeJobsDialog } from "store/reducers/adminJobsReducer"
import SteppedDialog from "components/views/stepped-dialog/SteppedDialog"
import { SlideUpTransition } from "components/views/common/transitions"
import { sxStyles } from "@careerfairy/shared-ui"
import { useGroup } from "layouts/GroupDashboardLayout"

const styles = sxStyles({
   dialog: {
      top: { xs: "70px", md: 0 },
      borderRadius: 5,
   },
})

type Props = {
   fieldId: string
}

const CustomJobForm: FC<Props> = ({ fieldId }) => {
   const dispatch = useDispatch()
   const { group } = useGroup()
   const allCustomJobs = useGroupCustomJobs(group.id)
   const isJobFormDialogOpen = useSelector(jobsDialogOpenSelector)

   const {
      values: {
         jobs: { customJobs },
      },
      setFieldValue,
   } = useLivestreamFormValues()

   const allCustomJobsPresenter = useMemo(
      () => allCustomJobs.map(pickPublicDataFromCustomJob),
      [allCustomJobs]
   )

   const handleCloseDialog = useCallback(() => {
      dispatch(closeJobsDialog())
   }, [dispatch])

   const handleCreateCustomJob = useCallback(
      (createdJob: PublicCustomJob) => {
         setFieldValue(fieldId, [...customJobs, createdJob])
      },
      [customJobs, fieldId, setFieldValue]
   )

   const handleUpdateCustomJob = useCallback(
      (updatedJob: PublicCustomJob) => {
         const indexToUpdate = customJobs.findIndex(
            (job) => job.id === updatedJob.id
         )
         const newValues = [
            ...customJobs.slice(0, indexToUpdate),
            updatedJob,
            ...customJobs.slice(indexToUpdate + 1),
         ]

         setFieldValue(fieldId, newValues)
      },
      [customJobs, fieldId, setFieldValue]
   )

   const views = useMemo(
      () => [
         {
            key: "livestream-create-form",
            Component: JobFormDialog,
            props: {
               afterCreateCustomJob: handleCreateCustomJob,
               afterUpdateCustomJob: handleUpdateCustomJob,
            },
         },
      ],
      [handleCreateCustomJob, handleUpdateCustomJob]
   )

   return (
      <Grid xs={12} item>
         <Stack spacing={2}>
            <SelectorCustomJobsDropDown
               fieldId={fieldId}
               label="Job related to this event"
               placeholder="Select jobs you want to attach"
               values={customJobs}
               options={allCustomJobsPresenter}
            />

            {customJobs?.length > 0 ? (
               <JobList fieldId={fieldId} />
            ) : (
               <EmptyJobs />
            )}

            {/* Using a SteppedDialog to be prepared for the future jobFormDialog */}
            <SteppedDialog
               key={isJobFormDialogOpen ? "open" : "closed"}
               bgcolor="#FCFCFC"
               handleClose={handleCloseDialog}
               open={isJobFormDialogOpen}
               views={views}
               transition={SlideUpTransition}
               sx={styles.dialog}
            />
         </Stack>
      </Grid>
   )
}

export default CustomJobForm
