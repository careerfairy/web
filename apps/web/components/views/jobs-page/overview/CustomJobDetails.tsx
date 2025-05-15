import { Stack } from "@mui/material"

import { Typography } from "@mui/material"
import NotFoundView from "components/views/livestream-dialog/views/common/NotFoundView"
import { sxStyles } from "types/commonTypes"
import { useJobsOverviewContext } from "../JobsOverviewContext"
const styles = sxStyles({
   root: {
      width: "100%",
      height: "100%",
      borderRadius: 2,
      border: "1px solid #E0E0E0",
      padding: 2,
   },
})

export const CustomJobDetails = () => {
   const { selectedJob } = useJobsOverviewContext()

   if (!selectedJob) {
      return (
         <Stack sx={styles.root}>
            <NotFoundView
               title="Job not found"
               description="The job you are trying to navigate to was not found"
            />
         </Stack>
      )
   }

   // TODO: Use proper component for this
   return (
      <Stack sx={styles.root}>
         <Typography variant="h6">Custom Job Details</Typography>
         <Typography>{selectedJob.title}</Typography>
         <Typography>{selectedJob.description}</Typography>
         <Typography>{selectedJob.sparks}</Typography>
         <Typography>{selectedJob.livestreams}</Typography>
      </Stack>
   )
}
