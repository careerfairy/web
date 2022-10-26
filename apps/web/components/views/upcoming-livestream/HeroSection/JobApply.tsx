import React, { useCallback, useState } from "react"
import { SuspenseWithBoundary } from "../../../ErrorBoundary"
import JobDialog from "../../streaming/LeftMenu/categories/jobs/JobDialog"
import {
   Box,
   Button,
   List,
   ListItem,
   ListItemAvatar,
   ListItemText,
   Typography,
} from "@mui/material"
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import { sxStyles } from "../../../../types/commonTypes"
import useUserLivestreamData from "../../../custom-hook/useUserLivestreamData"
import useIsMobile from "../../../custom-hook/useIsMobile"
import useLivestreamJobs from "../../../custom-hook/useLivestreamJobs"

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
   livestream
}

const JobApply = ({ livestream }: Props) => {
   const [isLoading, registeredUser] = useUserLivestreamData(livestream.id)

   if (isLoading || !registeredUser) {
      return null
   }

   return (
      <SuspenseWithBoundary fallback={""} hide={true}>
         <JobList livestream={livestream} />
      </SuspenseWithBoundary>
   )
}

const JobList = ({ livestream }: Props) => {
   let { jobs } = useLivestreamJobs(livestream.id, livestream.jobs)
   const [selectedJob, setSelectedJob] = useState(null)

   const onCloseDialog = useCallback(() => {
      setSelectedJob(null)
   }, [])

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
                  handleSelectJob={setSelectedJob}
               />
            ))}
         </List>

         {selectedJob && (
            <JobDialog
               job={selectedJob}
               onCloseDialog={onCloseDialog}
               livestreamId={livestream.id}
            />
         )}
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
         <ListItemAvatar sx={styles.icon}>
            <WorkOutlineOutlinedIcon color="secondary" />
         </ListItemAvatar>
         <ListItemText>
            <Typography
               variant="subtitle1"
               fontWeight="bold"
               textAlign={isMobile ? "center" : undefined}
            >
               {name}
               {isMobile && (
                  <Button
                     variant={"contained"}
                     onClick={handleClick}
                     color="primary"
                  >
                     Apply Now
                  </Button>
               )}
            </Typography>
         </ListItemText>
      </ListItem>
   )
}
export default JobApply
