import { PublicCustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { useTheme } from "@mui/material"
import { useJobDialogRouter } from "components/custom-hook/custom-job/useJobDialogRouter"
import { useCallback } from "react"
import { Briefcase } from "react-feather"
import EmptyFormSection from "../../../EmptyFormSection"
import { useLivestreamFormValues } from "../../../useLivestreamFormValues"
import JobCardPreview from "./JobCardPreview"

type Props = {
   fieldId: string
}
const JobList = ({ fieldId }: Props) => {
   const theme = useTheme()
   const { openJobDialog } = useJobDialogRouter()

   const {
      values: {
         jobs: { customJobs },
      },
      setFieldValue,
   } = useLivestreamFormValues()

   const handleRemoveJob = useCallback(
      (jobId: string) => {
         const filteredJobs = customJobs.filter(({ id }) => id !== jobId)
         setFieldValue(fieldId, filteredJobs)
      },
      [customJobs, fieldId, setFieldValue]
   )

   const handleEditJob = useCallback(
      (updatedJob: PublicCustomJob) => {
         openJobDialog(updatedJob.id)
      },
      [openJobDialog]
   )

   if (customJobs.length === 0) {
      return (
         <EmptyFormSection
            icon={<Briefcase size={70} color={theme.palette.secondary.main} />}
            title={"No jobs linked to your live stream"}
            caption={
               "Supercharge your recruitment efforts. Link a job opening and engage with the next generation of talent effortlessly."
            }
         />
      )
   }

   return customJobs.map((job: PublicCustomJob, index: number) => (
      <JobCardPreview
         key={index}
         job={job}
         handleRemoveJob={handleRemoveJob}
         handleEditJob={handleEditJob}
      />
   ))
}

export default JobList
