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
import { PublicCustomJob } from "@careerfairy/shared-lib/groups/customJobs"
import useIsAtsJob from "../../../../../custom-hook/useIsAtsJob"

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

type Props = {
   job: Job | PublicCustomJob
   handleSelectJob: (job: Job | PublicCustomJob) => void
}
const JobItem = ({ job, handleSelectJob }: Props) => {
   const isAtsJob = useIsAtsJob(job)

   let hiringManager: string, jobName: string

   if (isAtsJob) {
      hiringManager = job.getHiringManager()
      jobName = job.name
   } else {
      jobName = job.title
   }

   const handleClick = useCallback(() => {
      handleSelectJob(job)
      dataLayerEvent("livestream_job_open", {
         jobId: job.id,
         jobName: jobName,
      })
   }, [handleSelectJob, job, jobName])

   return (
      <ListItem
         disablePadding
         key={job.id}
         onClick={handleClick}
         sx={styles.itemWrapper}
      >
         <ListItemButton>
            <ListItemIcon sx={styles.icon}>
               <WorkOutlineOutlinedIcon color="secondary" />
            </ListItemIcon>
            <ListItemText>
               <Typography variant="subtitle1" fontWeight="bold">
                  {jobName}
               </Typography>

               {Boolean(hiringManager) ? (
                  <Typography variant="body2" mt={1} fontStyle="italic">
                     {`Posted by ${hiringManager}`}
                  </Typography>
               ) : null}
            </ListItemText>
         </ListItemButton>
      </ListItem>
   )
}

export default memo(JobItem)
