import { Job } from "@careerfairy/shared-lib/ats/Job"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Container, Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useLivestreamCompanyHostSWR from "components/custom-hook/live-stream/useLivestreamCompanyHostSWR"
import { useCombinedJobs } from "components/custom-hook/streaming/useCombinedJobs"
import { useCallback, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import JobCard from "../jobs/JobCard"
import JobDialog from "../jobs/JobDialog"
import { Heading } from "./Heading"

const styles = sxStyles({
   root: {
      mx: "auto",
   },
})

export const Jobs = () => {
   return (
      <SuspenseWithBoundary fallback={<></>}>
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

   const onCloseDialog = useCallback(() => {
      setSelectedJob(null)
   }, [])

   const handleJobClick = useCallback((job: Job | CustomJob) => {
      setSelectedJob(job)
   }, [])

   if (!jobsToShow) return null

   return (
      <Container sx={styles.root}>
         <Heading>
            {`Don't miss out! Apply now for the exciting jobs you saw live.`}
         </Heading>
         <Stack spacing={1.5}>
            {jobsToShow.map((job: Job | CustomJob) => (
               <JobCard
                  key={job.id}
                  job={job}
                  handleSelectJob={handleJobClick}
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
      </Container>
   )
}
