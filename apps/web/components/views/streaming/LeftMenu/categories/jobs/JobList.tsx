import useLivestreamJobs from "../../../../../custom-hook/useLivestreamJobs"
import { CircularProgress, List } from "@mui/material"
import React, { useCallback, useMemo, useState } from "react"
import { sxStyles } from "../../../../../../types/commonTypes"
import JobDialog from "./JobDialog"
import JobItem from "./JobItem"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { PublicCustomJob } from "@careerfairy/shared-lib/groups/customJobs"
import { Job } from "@careerfairy/shared-lib/ats/Job"
import useDialogStateHandler from "../../../../../custom-hook/useDialogStateHandler"
import { SuspenseWithBoundary } from "../../../../../ErrorBoundary"

const styles = sxStyles({
   list: {
      width: "100%",
      paddingX: 1,
   },
})

type Props = {
   livestream: LivestreamEvent
}
const JobList = ({ livestream }: Props) => {
   const { jobs: atsJobs } = useLivestreamJobs(undefined, livestream.jobs)
   const [selectedJob, setSelectedJob] = useState(null)
   const jobsToShow = useMemo(
      () => (atsJobs.length ? atsJobs : livestream?.customJobs || []),
      [atsJobs, livestream?.customJobs]
   )
   const [isDialogOpen, handleOpenDialog, handleCloseDialog] =
      useDialogStateHandler()

   const onCloseDialog = useCallback(() => {
      setSelectedJob(null)
      handleCloseDialog()
   }, [handleCloseDialog])

   const handleJobClick = useCallback(
      (job: Job | PublicCustomJob) => {
         setSelectedJob(job)
         handleOpenDialog()
      },
      [handleOpenDialog]
   )

   if (jobsToShow.length === 0) {
      return <div>No jobs at the moment</div>
   }

   return (
      <>
         <List sx={styles.list}>
            {jobsToShow.map((job: Job | PublicCustomJob) => (
               <JobItem
                  key={job.id}
                  job={job}
                  handleSelectJob={handleJobClick}
               />
            ))}
         </List>
         {selectedJob ? (
            <SuspenseWithBoundary fallback={<CircularProgress />}>
               <JobDialog
                  job={selectedJob}
                  handleClose={onCloseDialog}
                  livestream={livestream}
                  open={isDialogOpen}
               />
            </SuspenseWithBoundary>
         ) : null}
      </>
   )
}

export default JobList
