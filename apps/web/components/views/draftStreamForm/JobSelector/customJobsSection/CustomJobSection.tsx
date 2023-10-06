import { Grid, Typography } from "@mui/material"
import { FormikValues } from "formik"
import React, { useCallback, useState } from "react"
import { PublicCustomJob } from "@careerfairy/shared-lib/groups/customJobs"
import FormGroup from "../../FormGroup"
import SelectorCustomJobsDropDown from "./SelectorCustomJobsDropDown"
import CustomJobPreview from "./CustomJobPreview"
import CustomJobCreateOrEditFrom from "./CustomJobCreateOrEditFrom"
import Collapse from "@mui/material/Collapse"
import { groupRepo } from "../../../../../data/RepositoryInstances"
import useSnackbarNotifications from "../../../../custom-hook/useSnackbarNotifications"

type Props = {
   groupId: string
   jobs: PublicCustomJob[]
   values: FormikValues
   setFieldValue: (fieldName: string, value: any) => void
   isSubmitting: boolean
}

const CustomJobSection = ({
   groupId,
   jobs,
   values,
   setFieldValue,
   isSubmitting,
}: Props) => {
   const [showForm, setShowForm] = useState(false)
   const { successNotification, errorNotification } = useSnackbarNotifications()

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
            // Create a new custom job on Group subCollection
            await groupRepo.createGroupCustomJob(customJob, groupId)

            setFieldValue("customJobs", [customJob, ...values.customJobs])
            setShowForm(false)

            successNotification("New job opening was created")
         } catch (error) {
            errorNotification("Something went wrong, try again")
         }
      },
      [
         errorNotification,
         groupId,
         setFieldValue,
         successNotification,
         values.customJobs,
      ]
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
            await groupRepo.updateGroupCustomJob(updatedJob, groupId)

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
      [
         errorNotification,
         groupId,
         setFieldValue,
         successNotification,
         values.customJobs,
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
                  values={values.customJobs}
                  jobs={jobs}
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
