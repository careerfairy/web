import { Job } from "@careerfairy/shared-lib/ats/Job"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useGroupCustomJobs from "components/custom-hook/custom-job/useGroupCustomJobs"
import useLivestreamCompanyHostSWR from "components/custom-hook/live-stream/useLivestreamCompanyHostSWR"
import useLivestreamJobs from "components/custom-hook/useLivestreamJobs"
import { useCallback, useMemo, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import JobCard from "../jobs/JobCard"
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
   const { jobs: atsJobs } = useLivestreamJobs(livestreamId)
   const livestreamCustomJobs = useGroupCustomJobs(hostCompanyId, {
      livestreamId: livestreamId,
   })
   const [selectedJob, setSelectedJob] = useState(null)

   const jobsToShow: Job[] | CustomJob[] = useMemo(
      () => (atsJobs.length ? atsJobs : livestreamCustomJobs || []),
      [atsJobs, livestreamCustomJobs]
   )

   const onCloseDialog = useCallback(() => {
      setSelectedJob(null)
   }, [])

   const handleJobClick = useCallback((job: Job | CustomJob) => {
      setSelectedJob(job)
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
                     <JobCard job={job} handleSelectJob={handleJobClick} />
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
