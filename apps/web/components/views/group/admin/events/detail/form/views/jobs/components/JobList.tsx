import { PublicCustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { LivestreamJobAssociation } from "@careerfairy/shared-lib/livestreams"
import { useTheme } from "@mui/material"
import { useJobDialogRouter } from "components/custom-hook/custom-job/useJobDialogRouter"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useCallback, useMemo } from "react"
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
   const featureFlags = useFeatureFlags()
   const { group } = useGroup()

   const hasAtsIntegration =
      featureFlags.atsAdminPageFlag || group.atsAdminPageFlag

   const {
      values: {
         jobs: { customJobs, jobs: atsJobs },
      },
      setFieldValue,
   } = useLivestreamFormValues()

   const selectedJobs = useMemo(
      () => (hasAtsIntegration ? atsJobs : customJobs),
      [atsJobs, customJobs, hasAtsIntegration]
   )

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

   if (selectedJobs.length === 0) {
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

   return selectedJobs.map(
      (job: PublicCustomJob | LivestreamJobAssociation, index: number) => (
         <JobCardPreview
            key={index}
            job={job}
            handleRemoveJob={handleRemoveJob}
            handleEditJob={handleEditJob}
         />
      )
   )
}

export default JobList
