import { Grid, Typography } from "@mui/material"
import { FormikValues } from "formik"
import React, { useCallback, useState } from "react"
import { PublicCustomJob } from "@careerfairy/shared-lib/groups/customJobs"
import FormGroup from "../../FormGroup"
import SelectorCustomJobsDropDown from "./SelectorCustomJobsDropDown"
import CustomJobPreview from "./CustomJobPreview"
import CustomJobCreateOrEditFrom from "./CustomJobCreateOrEditFrom"
import Collapse from "@mui/material/Collapse"

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
      (customJob: PublicCustomJob) => {
         setFieldValue("customJobs", [customJob, ...values.customJobs])
         setShowForm(false)
      },
      [setFieldValue, values.customJobs]
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
      (updatedJob: PublicCustomJob) => {
         const updatedJobIndex = values.customJobs.findIndex(
            (job: PublicCustomJob) => job.id === updatedJob.id
         )

         setFieldValue("customJobs", [
            ...values.customJobs.slice(0, updatedJobIndex),
            updatedJob,
            ...values.customJobs.slice(updatedJobIndex + 1),
         ])
      },
      [setFieldValue, values.customJobs]
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
