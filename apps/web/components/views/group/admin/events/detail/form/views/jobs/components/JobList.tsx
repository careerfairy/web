import { FC, useCallback, useMemo } from "react"
import { useLivestreamFormValues } from "../../../useLivestreamFormValues"
import { PublicCustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import JobCardPreview from "./JobCardPreview"
import { Job } from "@careerfairy/shared-lib/ats/Job"
import { useDispatch } from "react-redux"
import { openJobsDialog } from "store/reducers/adminJobsReducer"

type Props = {
   atsJobs?: Job[]
   fieldId: string
}
const JobList: FC<Props> = ({ atsJobs, fieldId }) => {
   const dispatch = useDispatch()
   const {
      values: {
         jobs: { customJobs },
      },
      setFieldValue,
   } = useLivestreamFormValues()

   const selectedJobs = useMemo(
      () => (customJobs?.length > 0 ? customJobs : atsJobs),
      [atsJobs, customJobs]
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

   return selectedJobs.map((job: PublicCustomJob | Job) => (
      <JobCardPreview
         key={job.id}
         job={job}
         handleRemoveJob={handleRemoveJob}
         handleEditJob={handleEditJob}
      />
   ))
}

export default JobList
