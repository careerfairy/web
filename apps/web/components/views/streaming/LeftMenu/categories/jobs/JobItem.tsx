import {
   ListItem,
   ListItemButton,
   ListItemIcon,
   ListItemText,
} from "@mui/material"
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined"
import Typography from "@mui/material/Typography"
import React, { memo, useCallback } from "react"
import { sxStyles } from "../../../../../../types/commonTypes"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import { dataLayerEvent } from "../../../../../../util/analyticsUtils"

const styles = sxStyles({
   itemWrapper: {
      boxShadow: (theme) => theme.shadows[3],
      background: (theme) => theme.palette.background.default,
      borderRadius: 2,
      marginBottom: 1,
   },
   icon: {
      minWidth: "unset",
      marginRight: 2,
      alignSelf: "start",
      marginY: "5px",
   },
})

const JobItem = ({ job, handleSelectJob }: Props) => {
   const hiringManager = job.getHiringManager()
   const { id, name } = job

   const handleClick = useCallback(() => {
      handleSelectJob(job)
      dataLayerEvent("livestream_job_open", {
         jobId: job?.id,
         jobName: job?.name,
      })
   }, [handleSelectJob, job])

   return (
      <ListItem
         disablePadding
         key={id}
         onClick={handleClick}
         sx={styles.itemWrapper}
      >
         <ListItemButton>
            <ListItemIcon sx={styles.icon}>
               <WorkOutlineOutlinedIcon color="secondary" />
            </ListItemIcon>
            <ListItemText>
               <Typography variant="subtitle1" fontWeight="bold">
                  {name}
               </Typography>

               <Typography variant="body2" mt={1} fontStyle="italic">
                  {hiringManager && `Posted by ${hiringManager}`}
               </Typography>
            </ListItemText>
         </ListItemButton>
      </ListItem>
   )
}

type Props = {
   job: Job
   handleSelectJob: (job: Job) => void
}
export default memo(JobItem)
