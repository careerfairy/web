import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined"
import {
   ListItem,
   ListItemButton,
   ListItemIcon,
   ListItemText,
} from "@mui/material"
import Typography from "@mui/material/Typography"
import { memo, useCallback } from "react"
import { AnalyticsEvents } from "util/analytics/types"
import { sxStyles } from "../../../../../../types/commonTypes"
import { dataLayerLivestreamEvent } from "../../../../../../util/analyticsUtils"
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
   job: Job | CustomJob
   handleSelectJob: (job: Job | CustomJob) => void
   livestream: LivestreamEvent
}
const JobItem = ({ job, handleSelectJob, livestream }: Props) => {
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
      dataLayerLivestreamEvent(AnalyticsEvents.LivestreamJobOpen, livestream, {
         jobId: job.id,
         jobName: jobName,
      })
   }, [handleSelectJob, job, jobName, livestream])

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

               {hiringManager ? (
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
