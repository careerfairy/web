import useLivestreamJobs from "../../../../../custom-hook/useLivestreamJobs"
import {
   List,
   ListItem,
   ListItemButton,
   ListItemIcon,
   ListItemText,
} from "@mui/material"
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined"
import React, { useCallback, useState } from "react"
import { sxStyles } from "../../../../../../types/commonTypes"
import Typography from "@mui/material/Typography"
import JobDialog from "./JobDialog"

const styles = sxStyles({
   list: {
      width: "100%",
   },
   itemWrapper: {
      boxShadow: (theme) => theme.shadows[1],
   },
   icon: {
      minWidth: "unset",
      marginRight: 2,
      alignSelf: "start",
      marginY: "5px",
   },
})

const JobList = ({ livestream }) => {
   const { jobs } = useLivestreamJobs(undefined, livestream.jobs)
   const [selectedJob, setSelectedJob] = useState(null)

   const onCloseDialog = useCallback(() => {
      setSelectedJob(null)
   }, [])

   const renderJobItem = useCallback((job) => {
      const hiringManager = job.getHiringManager()
      const { id, name } = job

      return (
         <ListItem
            disablePadding
            key={id}
            onClick={() => setSelectedJob(job)}
            sx={styles.itemWrapper}
         >
            <ListItemButton>
               <ListItemIcon sx={styles.icon}>
                  <WorkOutlineOutlinedIcon color="secondary" />
               </ListItemIcon>
               <ListItemText>
                  <Typography variant="body1" fontWeight="bold">
                     {name}
                  </Typography>

                  <Typography variant="body2" mt={1} fontStyle="italic">
                     {hiringManager && `Posted by ${hiringManager}`}
                  </Typography>
               </ListItemText>
            </ListItemButton>
         </ListItem>
      )
   }, [])

   if (jobs.length === 0) {
      return <div>No jobs at the moment</div>
   }

   return (
      <>
         <List sx={styles.list}>{jobs.map((job) => renderJobItem(job))}</List>
         {selectedJob && (
            <JobDialog
               job={selectedJob}
               onCloseDialog={onCloseDialog}
               livestreamId={livestream.id}
            />
         )}
      </>
   )
}

export default JobList
