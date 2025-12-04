import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { CircularProgress, List } from "@mui/material"
import { useCallback, useMemo, useState } from "react"
import { sxStyles } from "../../../../../../types/commonTypes"
import useGroupCustomJobs from "../../../../../custom-hook/custom-job/useGroupCustomJobs"
import useDialogStateHandler from "../../../../../custom-hook/useDialogStateHandler"
import { SuspenseWithBoundary } from "../../../../../ErrorBoundary"
import JobDialog from "./JobDialog"
import JobItem from "./JobItem"

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
   const livestreamCustomJobs = useGroupCustomJobs(livestream.groupIds[0], {
      livestreamId: livestream.id,
   })

   const [selectedJob, setSelectedJob] = useState<CustomJob | null>(null)
   const jobsToShow = useMemo(
      () => livestreamCustomJobs || [],
      [livestreamCustomJobs]
   )
   const [isDialogOpen, handleOpenDialog, handleCloseDialog] =
      useDialogStateHandler()

   const onCloseDialog = useCallback(() => {
      setSelectedJob(null)
      handleCloseDialog()
   }, [handleCloseDialog])

   const handleJobClick = useCallback(
      (job: CustomJob) => {
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
            {jobsToShow.map((job: CustomJob) => (
               <JobItem
                  key={job.id}
                  job={job}
                  handleSelectJob={handleJobClick}
                  livestream={livestream}
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
