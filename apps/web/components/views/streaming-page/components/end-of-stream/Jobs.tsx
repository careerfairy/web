import { Job } from "@careerfairy/shared-lib/ats/Job"
import {
   CustomJob,
   CustomJobApplicationSourceTypes,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Skeleton, Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useGroupCustomJobs from "components/custom-hook/custom-job/useGroupCustomJobs"
import useLivestreamCompanyHostSWR from "components/custom-hook/live-stream/useLivestreamCompanyHostSWR"
import { useLivestreamData } from "components/custom-hook/streaming"
import CustomJobDetailsDialog from "components/views/common/jobs/CustomJobDetailsDialog"
import JobCard from "components/views/common/jobs/JobCard"
import { useCallback, useState } from "react"
import { AnalyticsEvents } from "util/analytics/types"
import { dataLayerLivestreamEvent } from "util/analyticsUtils"
import { useStreamingContext } from "../../context"
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
   const livestream = useLivestreamData()
   const jobsToShow = useGroupCustomJobs(groupId, {
      livestreamId: livestreamId,
   })
   const [selectedJob, setSelectedJob] = useState<CustomJob | null>(null)

   const onCloseDialog = () => {
      setSelectedJob(null)
   }

   const handleClick = useCallback(
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
               heroSx={{
                  pb: "8px !important",
               }}
               hideLinkedLivestreams
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
