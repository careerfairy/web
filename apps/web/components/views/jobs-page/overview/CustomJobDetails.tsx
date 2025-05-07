import { Stack } from "@mui/material"

import { Typography } from "@mui/material"
import CustomJobDetailsView from "components/views/jobs/components/custom-jobs/CustomJobDetailsView"
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

   return (
      <Stack sx={styles.root}>
         {selectedJob ? (
            <CustomJobDetailsView job={selectedJob} />
         ) : (
            <Typography>Select a job from the list</Typography>
         )}
      </Stack>
   )
}
