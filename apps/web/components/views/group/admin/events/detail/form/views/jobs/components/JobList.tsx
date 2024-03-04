import { FC, useCallback, useMemo } from "react"
import { useLivestreamFormValues } from "../../../useLivestreamFormValues"
import { PublicCustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import JobCardPreview from "./JobCardPreview"
import { useDispatch } from "react-redux"
import { openJobsDialog } from "store/reducers/adminJobsReducer"
import EmptyJobs from "./EmptyJobs"
import { LivestreamJobAssociation } from "@careerfairy/shared-lib/livestreams"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import { useGroup } from "layouts/GroupDashboardLayout"

type Props = {
   fieldId: string
}
const JobList: FC<Props> = ({ fieldId }) => {
   const dispatch = useDispatch()
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
         dispatch(openJobsDialog(updatedJob.id))
      },
      [dispatch]
   )

   if (selectedJobs.length === 0) {
      return <EmptyJobs />
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
