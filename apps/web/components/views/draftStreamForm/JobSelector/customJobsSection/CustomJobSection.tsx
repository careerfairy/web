import { Grid, Typography } from "@mui/material"
import { FormikValues } from "formik"
import React, { useCallback, useMemo, useState } from "react"
import {
   pickPublicDataFromCustomJob,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import FormGroup from "../../FormGroup"
import SelectorCustomJobsDropDown from "./SelectorCustomJobsDropDown"
import CustomJobPreview from "./CustomJobPreview"
import CustomJobCreateOrEditFrom from "./CustomJobCreateOrEditFrom"
import Collapse from "@mui/material/Collapse"
import { customJobRepo } from "../../../../../data/RepositoryInstances"
import useSnackbarNotifications from "../../../../custom-hook/useSnackbarNotifications"
import useGroupCustomJobs from "../../../../custom-hook/useGroupCustomJobs"

type Props = {
   groupId: string
   values: FormikValues
   setFieldValue: (fieldName: string, value: any) => void
   isSubmitting: boolean
}

const CustomJobSection = ({
   groupId,
   values,
   setFieldValue,
   isSubmitting,
}: Props) => {
   const { successNotification, errorNotification } = useSnackbarNotifications()
   const allCustomJobs = useGroupCustomJobs(groupId)

   const allCustomJobsPresenter = useMemo(
      () => allCustomJobs.map(pickPublicDataFromCustomJob),
      [allCustomJobs]
   )
   const [showForm, setShowForm] = useState(false)

   const handleChange = useCallback(
      (name: string, value: PublicCustomJob[]) => {
         setFieldValue(name, value)
      },
      [setFieldValue]
   )

   const handleOpenCreateJobForm = useCallback(() => {
      setShowForm(true)
   }, [])

   const handleCancelCreateNewJob = useCallback(() => {
      setShowForm(false)
   }, [])

   const handleCreateNewJob = useCallback(
      async (customJob: PublicCustomJob) => {
         try {
            // Create a new custom job on CustomJobs collection
            const createdJob = await customJobRepo.createCustomJob(customJob)

            setFieldValue("customJobs", [
               pickPublicDataFromCustomJob(createdJob),
               ...values.customJobs,
            ])
            setShowForm(false)

            successNotification("New job opening was created")
         } catch (error) {
            errorNotification("Something went wrong, try again")
         }
      },
      [errorNotification, setFieldValue, successNotification, values.customJobs]
   )

   const handleRemoveJob = useCallback(
      (jobId: string) => {
         const filteredJobs = values.customJobs.filter(
            (job: PublicCustomJob) => job.id !== jobId
         )

         setFieldValue("customJobs", filteredJobs)
      },
      [setFieldValue, values.customJobs]
   )

   const handleEditJob = useCallback(
      async (updatedJob: PublicCustomJob) => {
         try {
            const updatedJobIndex = values.customJobs.findIndex(
               (job: PublicCustomJob) => job.id === updatedJob.id
            )

            // Update custom job on Group subCollection
            await customJobRepo.updateCustomJob(updatedJob)

            setFieldValue("customJobs", [
               ...values.customJobs.slice(0, updatedJobIndex),
               updatedJob,
               ...values.customJobs.slice(updatedJobIndex + 1),
            ])

            successNotification("Job opening was updated")
         } catch (error) {
            errorNotification("Something went wrong, try again")
         }
      },
      [errorNotification, setFieldValue, successNotification, values.customJobs]
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
                  values={values.customJobs}
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

               {values.customJobs.map((job: PublicCustomJob) => (
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
