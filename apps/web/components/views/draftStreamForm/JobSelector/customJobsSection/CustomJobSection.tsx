import { CircularProgress, Grid, Typography } from "@mui/material"
import React, {
   Dispatch,
   SetStateAction,
   useCallback,
   useMemo,
   useState,
} from "react"
import {
   CustomJob,
   pickPublicDataFromCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import FormGroup from "../../FormGroup"
import SelectorCustomJobsDropDown from "./SelectorCustomJobsDropDown"
import CustomJobPreview from "./CustomJobPreview"
import Collapse from "@mui/material/Collapse"
import { customJobRepo } from "../../../../../data/RepositoryInstances"
import useSnackbarNotifications from "../../../../custom-hook/useSnackbarNotifications"
import dynamic from "next/dynamic"

type Props = {
   groupId: string
   isSubmitting: boolean
   streamId: string
   selectedCustomJobs: CustomJob[]
   onSelectedCustomJobs: Dispatch<SetStateAction<CustomJob[]>>
   allJobs: CustomJob[]
}

const CustomJobSection = ({
   groupId,
   streamId,
   allJobs,
   selectedCustomJobs,
   onSelectedCustomJobs,
   isSubmitting,
}: Props) => {
   const { successNotification, errorNotification } = useSnackbarNotifications()

   const allCustomJobsPresenter = useMemo(
      () => allJobs.map(pickPublicDataFromCustomJob),
      [allJobs]
   )
   const [showForm, setShowForm] = useState(false)

   const CustomJobCreateOrEditFrom = dynamic(
      () => import("./CustomJobCreateOrEditFrom"),
      {
         ssr: false,
         loading: () => <CircularProgress />,
      }
   )

   const handleChange = useCallback(
      (_: string, value: CustomJob[]) => {
         onSelectedCustomJobs(value)
      },
      [onSelectedCustomJobs]
   )

   const handleOpenCreateJobForm = useCallback(() => {
      setShowForm(true)
   }, [])

   const handleCancelCreateNewJob = useCallback(() => {
      setShowForm(false)
   }, [])

   const handleCreateNewJob = useCallback(
      async (customJob: CustomJob) => {
         try {
            // Create a new custom job on CustomJobs collection
            const createdJob = await customJobRepo.createCustomJob(
               customJob,
               streamId
            )

            onSelectedCustomJobs((prevJobs: CustomJob[]) => [
               createdJob,
               ...prevJobs,
            ])

            setShowForm(false)

            successNotification("New job opening was created")
         } catch (error) {
            errorNotification("Something went wrong, try again")
         }
      },
      [errorNotification, onSelectedCustomJobs, streamId, successNotification]
   )

   const handleRemoveJob = useCallback(
      (jobId: string) => {
         const filteredJobs = selectedCustomJobs.filter(
            (job: CustomJob) => job.id !== jobId
         )

         onSelectedCustomJobs(filteredJobs)
      },
      [onSelectedCustomJobs, selectedCustomJobs]
   )

   const handleEditJob = useCallback(
      async (updatedJob: CustomJob) => {
         try {
            const updatedJobIndex = selectedCustomJobs.findIndex(
               (job: CustomJob) => job.id === updatedJob.id
            )

            // Update custom job on Group subCollection
            await customJobRepo.updateCustomJob(updatedJob)

            onSelectedCustomJobs((prevJobs: CustomJob[]) => [
               ...prevJobs.slice(0, updatedJobIndex),
               updatedJob,
               ...prevJobs.slice(updatedJobIndex + 1),
            ])

            successNotification("Job opening was updated")
         } catch (error) {
            errorNotification("Something went wrong, try again")
         }
      },
      [
         errorNotification,
         onSelectedCustomJobs,
         selectedCustomJobs,
         successNotification,
      ]
   )

   return (
      <>
         <Typography fontWeight="bold" variant="h4">
            Jobs
         </Typography>
         <Typography variant="subtitle1" mt={1} color="textSecondary">
            Create and insert all job openings that you want to share with the
            talent community!
         </Typography>

         <FormGroup container boxShadow={0}>
            <Grid xs={12} item>
               <SelectorCustomJobsDropDown
                  name="customJobs"
                  label="Job related to this event"
                  placeholder="Select a job"
                  values={selectedCustomJobs}
                  jobs={allCustomJobsPresenter}
                  disabled={isSubmitting}
                  handleChange={handleChange}
                  handleOpenCreateJobForm={handleOpenCreateJobForm}
                  isNewJobFormOpen={showForm}
               />

               {
                  <Collapse in={showForm} timeout={500}>
                     <CustomJobCreateOrEditFrom
                        groupId={groupId}
                        handleCreateNewJob={handleCreateNewJob}
                        handleCancelCreateNewJob={handleCancelCreateNewJob}
                     />
                  </Collapse>
               }

               {selectedCustomJobs.map((job: CustomJob) => (
                  <CustomJobPreview
                     key={job.id}
                     job={job}
                     handleRemoveJob={handleRemoveJob}
                     handleEditJob={handleEditJob}
                  />
               ))}
            </Grid>
         </FormGroup>
      </>
   )
}

export default CustomJobSection
