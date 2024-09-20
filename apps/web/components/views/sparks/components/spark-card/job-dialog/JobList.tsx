import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import CloseIcon from "@mui/icons-material/Close"
import {
   Box,
   DialogContent,
   DialogTitle,
   IconButton,
   Typography,
} from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import JobCard from "components/views/common/jobs/JobCard"
import { useStepper } from "components/views/stepped-dialog/SteppedDialog"
import { JobCardSkeleton } from "components/views/streaming-page/components/jobs/JobListSkeleton"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   titleContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      pl: 3,
      pr: 2,
   },
   mobileTitle: {
      fontWeight: 600,
      fontSize: "20px",
   },
   title: {
      fontWeight: 600,
      fontSize: "20px",
   },
   closeIcon: {
      "& svg": {
         width: { xs: "32px", md: "24px" },
         height: { xs: "32px", md: "24px" },
         color: "black.main",
      },
   },
})

type Props = {
   jobs: CustomJob[]
   handleClose: () => void
   handleClick: (job: CustomJob, event: React.MouseEvent) => void
}

const JobList = ({ jobs, handleClose, handleClick }: Props) => {
   const { moveToNext } = useStepper()
   const isMobile = useIsMobile()

   const onClick = (job: CustomJob, event: React.MouseEvent) => {
      handleClick(job, event)
      moveToNext()
   }

   return (
      <>
         <DialogTitle sx={styles.titleContainer}>
            <Typography sx={styles.title}>Jobs in focus</Typography>
            <Box sx={styles.closeIcon}>
               <IconButton onClick={handleClose}>
                  <CloseIcon />
               </IconButton>
            </Box>
         </DialogTitle>

         <DialogContent>
            {jobs.map((job: CustomJob) => (
               <Box key={job.id}>
                  <SuspenseWithBoundary fallback={<JobCardSkeleton />}>
                     <JobCard
                        job={job}
                        handleClick={onClick}
                        previewMode
                        hideJobUrl
                        smallCard={isMobile}
                     />
                  </SuspenseWithBoundary>
               </Box>
            ))}
         </DialogContent>
      </>
   )
}

export default JobList
