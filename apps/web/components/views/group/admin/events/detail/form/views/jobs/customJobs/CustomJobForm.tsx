import {
   CustomJob,
   PublicCustomJob,
   pickPublicDataFromCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Grid, Stack } from "@mui/material"
import useGroupCustomJobs from "components/custom-hook/custom-job/useGroupCustomJobs"
import JobDialog from "components/views/group/admin/jobs/dialog"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useCallback, useMemo } from "react"
import { useDispatch } from "react-redux"
import { closeJobsDialog } from "store/reducers/adminJobsReducer"
import { useLivestreamFormValues } from "../../../useLivestreamFormValues"
import JobList from "../components/JobList"
import SelectorCustomJobsDropDown from "./components/SelectorCustomJobsDropDown"

const FIELD_ID = "jobs.customJobs"

const CustomJobForm = () => {
   const dispatch = useDispatch()
   const { group } = useGroup()
   const allCustomJobs = useGroupCustomJobs(group.id)

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

   const handleCreateCustomJob = useCallback(
      (createdJob: PublicCustomJob) => {
         setFieldValue(FIELD_ID, [...customJobs, createdJob])
         dispatch(closeJobsDialog())
      },
      [customJobs, dispatch, setFieldValue]
   )

   const handleUpdateCustomJob = useCallback(
      (updatedJob: CustomJob) => {
         const indexToUpdate = customJobs.findIndex(
            (job) => job.id === updatedJob.id
         )
         const newValues = [
            ...customJobs.slice(0, indexToUpdate),
            updatedJob,
            ...customJobs.slice(indexToUpdate + 1),
         ]

         setFieldValue(FIELD_ID, newValues)
         dispatch(closeJobsDialog())
      },
      [customJobs, dispatch, setFieldValue]
   )

   return (
      <Grid xs={12} item>
         <Stack spacing={2}>
            <SelectorCustomJobsDropDown
               fieldId={FIELD_ID}
               label="Job related to this event"
               placeholder="Select jobs you want to attach"
               values={customJobs}
               options={allCustomJobsPresenter}
            />

            <JobList fieldId={FIELD_ID} />

            <JobDialog
               afterCreateCustomJob={handleCreateCustomJob}
               afterUpdateCustomJob={handleUpdateCustomJob}
            />
         </Stack>
      </Grid>
   )
}

export default CustomJobForm
