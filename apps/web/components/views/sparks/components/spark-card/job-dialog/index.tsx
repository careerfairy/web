import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useIsMobile from "components/custom-hook/useIsMobile"
import { SlideUpTransition } from "components/views/common/transitions"
import CustomJobDetailsSkeleton from "components/views/jobs/components/custom-jobs/skeletons/CustomJobDetailsSkeleton"
import SteppedDialog from "components/views/stepped-dialog/SteppedDialog"
import { useCallback, useMemo, useState } from "react"
import { sxStyles } from "types/commonTypes"
import JobDetails from "./JobDetails"
import { JobList } from "./JobList"

const styles = sxStyles({
   dialog: {
      height: { xs: "auto", md: "auto" },
      maxHeight: { xs: "calc(90dvh)", md: "800px" },
      alignSelf: { xs: "self-end", md: "unset" },
      borderRadius: "12px",
      background: "white",
   },
   dialogMobile: {
      borderRadius: "12px 12px 0px 0px",
   },
})

type Props = {
   isOpen: boolean
   handleClose: () => void
   jobs: CustomJob[]
   spark: SparkPresenter
}

const JobDialog = ({ isOpen, handleClose, jobs, spark }: Props) => {
   const [selectedJob, setSelectedJob] = useState<CustomJob>(null)

   // This function prevents the event from propagating up the parent Spark Card when the dialog is clicked.
   const handleDialogInteraction = useCallback(
      (e: React.MouseEvent | React.TouchEvent | WheelEvent) => {
         e.stopPropagation()
      },
      []
   )

   // This function sets the selected job and prevents the event from propagating up the parent Spark Card when a job in the list is clicked.
   const handleJobListCLick = useCallback(
      (job: CustomJob, event: React.MouseEvent) => {
         setSelectedJob(job)
         event.stopPropagation()
      },
      []
   )

   const views = useMemo(
      () => [
         {
            key: "job-list",
            Component: () => (
               <JobList
                  jobs={jobs}
                  handleClose={handleClose}
                  handleClick={handleJobListCLick}
               />
            ),
         },
         {
            key: "job-detail",
            Component: () => (
               <SuspenseWithBoundary fallback={<CustomJobDetailsSkeleton />}>
                  <JobDetails job={selectedJob} spark={spark} />
               </SuspenseWithBoundary>
            ),
         },
      ],
      [handleClose, handleJobListCLick, jobs, selectedJob, spark]
   )

   const isMobile = useIsMobile()
   return (
      <SteppedDialog
         key={isOpen ? "open" : "closed"}
         bgcolor="#FCFCFC"
         handleClose={handleClose}
         open={isOpen}
         views={views}
         initialStep={0}
         transition={SlideUpTransition}
         sx={[styles.dialog, isMobile ? styles.dialogMobile : null]}
         onClick={handleDialogInteraction}
      />
   )
}

export default JobDialog
