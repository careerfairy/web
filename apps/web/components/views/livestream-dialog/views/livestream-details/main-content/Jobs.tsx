import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { Box, Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useLivestreamCompanyHostSWR from "components/custom-hook/live-stream/useLivestreamCompanyHostSWR"
import JobCard from "components/views/common/jobs/JobCard"
import { useLiveStreamDialog } from "components/views/livestream-dialog/LivestreamDialog"
import { FC } from "react"
import useGroupCustomJobs from "../../../../../custom-hook/custom-job/useGroupCustomJobs"
import Loader from "../../../../loader/Loader"
import SectionTitle from "./SectionTitle"

interface Props {
   presenter: LivestreamPresenter
}

const Jobs: FC<Props> = (props) => {
   return (
      <Box>
         <SectionTitle>Jobs in focus</SectionTitle>
         <SuspenseWithBoundary fallback={<Loader />}>
            <JobsComponent {...props} />
         </SuspenseWithBoundary>
      </Box>
   )
}

const JobsComponent: FC<Props> = ({ presenter }) => {
   const { data: livestreamHost } = useLivestreamCompanyHostSWR(presenter.id)
   const livestreamCustomJobs = useGroupCustomJobs(livestreamHost.id, {
      livestreamId: presenter.id,
   })?.filter((job) => job.published)

   const jobsToPresent = livestreamCustomJobs || []

   return (
      <Stack spacing={2}>
         {jobsToPresent.map((job) => (
            <JobItem presenter={presenter} key={job.id} job={job} />
         ))}
      </Stack>
   )
}

type JobItemProps = {
   job: CustomJob
   presenter: LivestreamPresenter
}

const JobItem: FC<JobItemProps> = ({ job }) => {
   const { goToJobDetails } = useLiveStreamDialog()

   return (
      <JobCard
         job={job}
         previewMode
         handleClick={() => goToJobDetails(job.id)}
         hideJobUrl
      />
   )
}

export default Jobs
