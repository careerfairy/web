import React, { useCallback, useState } from "react"
import { SuspenseWithBoundary } from "../../../ErrorBoundary"
import JobDialog from "../../streaming/LeftMenu/categories/jobs/JobDialog"
import {
   Box,
   Button,
   CircularProgress,
   List,
   ListItem,
   ListItemText,
   Typography,
} from "@mui/material"
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import { sxStyles } from "../../../../types/commonTypes"
import useUserLivestreamData from "../../../custom-hook/useUserLivestreamData"
import useIsMobile from "../../../custom-hook/useIsMobile"
import useLivestreamJobs from "../../../custom-hook/useLivestreamJobs"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { useAuth } from "../../../../HOCs/AuthProvider"
import Skeleton from "@mui/material/Skeleton"
import useDialogStateHandler from "../../../custom-hook/useDialogStateHandler"
import { PublicCustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"

const styles = sxStyles({
   itemWrapper: {
      boxShadow: (theme) => theme.shadows[3],
      background: (theme) => theme.palette.background.default,
      borderRadius: 2,
   },
   icon: {
      minWidth: "unset",
      marginRight: 1,
      alignSelf: "start",
      marginY: "5px",
   },
   list: {
      width: "100%",
      padding: 0,
   },
})

type Props = {
   livestream: LivestreamEvent
}

const JobApply = ({ livestream }: Props) => {
   const { authenticatedUser } = useAuth()
   const userLivestreamData = useUserLivestreamData(
      livestream.id,
      authenticatedUser.email
   )

   if (!userLivestreamData) {
      // user didn't register / participated in the event
      return null
   }

   // don't show the job list if the event didn't start yet
   const startDate = livestream?.start?.toDate()?.getTime()
   // also don't show the job list while the students are joining,
   // show them 20min after the livestream has started at least
   const delay = 20 * 60 * 1000 // 20m
   if (startDate > Date.now() - delay) {
      return null
   }

   return (
      <SuspenseWithBoundary fallback={<LoadingJobsSpinner />} hide={true}>
         <JobList livestream={livestream} />
      </SuspenseWithBoundary>
   )
}

const LoadingJobsSpinner = () => {
   return (
      <Box py={2}>
         <div>Loading jobs..</div>
         <Skeleton height={30} />
      </Box>
   )
}

const JobList = ({ livestream }: Props) => {
   let { jobs } = useLivestreamJobs(livestream.id, livestream.jobs)
   const [selectedJob, setSelectedJob] = useState(null)
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

   if (jobs.length === 0) {
      // no active jobs in ATS
      return null
   }

   return (
      <Box py={2}>
         <Box py={1} display="flex" alignContent="center" alignSelf="center">
            You can still apply to the following Jobs:
         </Box>

         <List sx={styles.list}>
            {jobs.map((job) => (
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
      </Box>
   )
}

type JobItemProps = {
   job: Job
   handleSelectJob: (job: Job) => void
}

const JobItem = ({ job, handleSelectJob }: JobItemProps) => {
   const { id, name } = job
   const isMobile = useIsMobile()

   const handleClick = useCallback(() => {
      handleSelectJob(job)
   }, [handleSelectJob, job])

   return (
      <ListItem
         sx={{ marginBottom: 3 }}
         disablePadding
         key={id}
         secondaryAction={
            !isMobile ? (
               <Button
                  variant={"contained"}
                  onClick={handleClick}
                  color="primary"
               >
                  Apply Now
               </Button>
            ) : null
         }
      >
         <ListItemText>
            <Typography
               variant="subtitle1"
               fontWeight="bold"
               textAlign={isMobile ? "center" : undefined}
               display="flex"
               alignContent="center"
               alignItems="center"
               sx={{ flexWrap: "wrap" }}
            >
               <WorkOutlineOutlinedIcon color="secondary" sx={{ mr: 1 }} />
               {name}
               {isMobile ? (
                  <Button
                     variant={"contained"}
                     onClick={handleClick}
                     color="primary"
                     sx={{ margin: "0 auto" }}
                  >
                     Apply Now
                  </Button>
               ) : null}
            </Typography>
         </ListItemText>
      </ListItem>
   )
}
export default JobApply
