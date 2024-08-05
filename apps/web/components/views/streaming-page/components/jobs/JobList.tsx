import { Job } from "@careerfairy/shared-lib/ats/Job"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useLivestreamCompanyHostSWR from "components/custom-hook/live-stream/useLivestreamCompanyHostSWR"
import { useCombinedJobs } from "components/custom-hook/streaming/useCombinedJobs"
import JobCard from "components/views/common/jobs/JobCard"
import { useCallback, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { dataLayerEvent } from "util/analyticsUtils"
import { useStreamingContext } from "../../context"
// import JobCard from "../jobs/JobCard"
import JobDialog from "../jobs/JobDialog"
import { EmptyJobsView } from "./EmptyJobsView"
import { JobCardSkeleton, JobListSkeleton } from "./JobListSkeleton"

const styles = sxStyles({
   jobList: {
      gap: 1.5,
   },
})

export const JobList = () => {
   return (
      <SuspenseWithBoundary fallback={<JobListSkeleton />}>
         <ContentWrapper />
      </SuspenseWithBoundary>
   )
}

const ContentWrapper = () => {
   const { livestreamId, isHost } = useStreamingContext()
   const { data: hostCompany } = useLivestreamCompanyHostSWR(livestreamId)

   if (!hostCompany) return null

   return (
      <Content
         livestreamId={livestreamId}
         isHost={isHost}
         hostCompanyId={hostCompany.id}
      />
   )
}

const Content = ({ livestreamId, isHost, hostCompanyId }) => {
   const [selectedJob, setSelectedJob] = useState(null)

   const jobsToShow = useCombinedJobs(livestreamId, hostCompanyId)

   const onCloseDialog = useCallback(() => {
      setSelectedJob(null)
   }, [])

   const handleJobClick = useCallback((job: Job | CustomJob) => {
      const jobName = (job as Job)?.name ?? (job as CustomJob)?.title
      setSelectedJob(job)
      dataLayerEvent("livestream_job_open", {
         jobId: job.id,
         jobName: jobName,
      })
   }, [])

   if (isHost && jobsToShow.length == 0) {
      return <EmptyJobsView />
   }

   return (
      <>
         <Stack sx={styles.jobList}>
            {jobsToShow.map((job: Job | CustomJob) => (
               <Box key={job.id}>
                  <SuspenseWithBoundary fallback={<JobCardSkeleton />}>
                     <JobCard
                        job={job}
                        handleClick={handleJobClick}
                        previewMode
                        smallCard
                     />
                  </SuspenseWithBoundary>
               </Box>
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
      </>
   )
}
