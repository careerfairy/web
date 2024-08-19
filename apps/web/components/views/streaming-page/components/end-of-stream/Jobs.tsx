import { Job } from "@careerfairy/shared-lib/ats/Job"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Skeleton, Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useLivestreamCompanyHostSWR from "components/custom-hook/live-stream/useLivestreamCompanyHostSWR"
import { useCombinedJobs } from "components/custom-hook/streaming/useCombinedJobs"
import JobCard from "components/views/common/jobs/JobCard"
import { useCallback, useState } from "react"
import { dataLayerEvent } from "util/analyticsUtils"
import { useStreamingContext } from "../../context"
import JobDialog from "../jobs/JobDialog"
import { JobCardSkeleton } from "../jobs/JobListSkeleton"
import { EndOfStreamContainer } from "./Container"
import { Heading } from "./Heading"

export const Jobs = () => {
   return (
      <SuspenseWithBoundary fallback={<Loader />}>
         <ContentWrapper />
      </SuspenseWithBoundary>
   )
}

const ContentWrapper = () => {
   const { livestreamId } = useStreamingContext()
   const { data: hostCompany } = useLivestreamCompanyHostSWR(livestreamId)

   if (!hostCompany) return null

   return <Content groupId={hostCompany?.id} />
}

type ContentProps = {
   groupId: string
}
export const Content = ({ groupId }: ContentProps) => {
   const { livestreamId } = useStreamingContext()
   const jobsToShow = useCombinedJobs(livestreamId, groupId)
   const [selectedJob, setSelectedJob] = useState<Job | CustomJob | null>(null)

   const onCloseDialog = () => {
      setSelectedJob(null)
   }

   const handleClick = useCallback((job: Job | CustomJob) => {
      const jobName = (job as Job)?.name ?? (job as CustomJob)?.title

      setSelectedJob(job)
      dataLayerEvent("livestream_job_open", {
         jobId: job.id,
         jobName: jobName,
      })
   }, [])

   if (!jobsToShow) return null // we Need to fetch the jobs before even rendering the Header

   return (
      <EndOfStreamContainer>
         <Heading>
            {`Don't miss out! Apply now for the exciting jobs you saw live.`}
         </Heading>
         <Stack spacing={1.5}>
            {jobsToShow.map((job: Job | CustomJob) => (
               <JobCard
                  key={job.id}
                  job={job}
                  handleClick={handleClick}
                  previewMode
               />
            ))}
         </Stack>
         {selectedJob ? (
            <JobDialog
               livestreamId={livestreamId}
               job={selectedJob}
               handleDialogClose={onCloseDialog}
               open={Boolean(selectedJob)}
            />
         ) : null}
      </EndOfStreamContainer>
   )
}

const Loader = () => {
   return (
      <EndOfStreamContainer>
         <Heading>
            <Skeleton width={250} />
         </Heading>
         <Stack spacing={1.5}>
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
         </Stack>
      </EndOfStreamContainer>
   )
}
