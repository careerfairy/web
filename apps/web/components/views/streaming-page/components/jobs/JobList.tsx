import { Job } from "@careerfairy/shared-lib/ats/Job"
import {
   CustomJob,
   CustomJobApplicationSourceTypes,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useGroupCustomJobs from "components/custom-hook/custom-job/useGroupCustomJobs"
import useLivestreamCompanyHostSWR from "components/custom-hook/live-stream/useLivestreamCompanyHostSWR"
import { useLivestreamData } from "components/custom-hook/streaming"
import CustomJobDetailsDialog from "components/views/common/jobs/CustomJobDetailsDialog"
import JobCard from "components/views/common/jobs/JobCard"
import { useCallback, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { AnalyticsEvents } from "util/analytics/types"
import { dataLayerLivestreamEvent } from "util/analyticsUtils"
import { useStreamingContext } from "../../context"
import { EmptyJobsView } from "./EmptyJobsView"
import { JobCardSkeleton, JobListSkeleton } from "./JobListSkeleton"

const styles = sxStyles({
   jobList: {
      gap: 1.5,
   },
   heroSx: {
      pb: "8px !important",
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
   const [selectedJob, setSelectedJob] = useState<CustomJob>(null)
   const livestream = useLivestreamData()

   const jobsToShow = useGroupCustomJobs(hostCompanyId, {
      livestreamId: livestreamId,
   })

   const onCloseDialog = useCallback(() => {
      setSelectedJob(null)
   }, [])

   const handleJobClick = useCallback(
      (job: CustomJob) => {
         setSelectedJob(job)
         dataLayerLivestreamEvent(
            AnalyticsEvents.LivestreamJobOpen,
            livestream,
            {
               jobId: job.id,
               jobName: job.title,
            }
         )
      },
      [livestream]
   )

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
            <CustomJobDetailsDialog
               customJobId={selectedJob.id}
               isOpen={Boolean(selectedJob)}
               onClose={onCloseDialog}
               source={{
                  source: CustomJobApplicationSourceTypes.Livestream,
                  id: livestreamId,
               }}
               heroContent={
                  <CustomJobDetailsDialog.CloseButton onClose={onCloseDialog} />
               }
               hideLinkedLivestreams
               heroSx={styles.heroSx}
            />
         ) : null}
      </>
   )
}
