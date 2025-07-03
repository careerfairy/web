import { Stack } from "@mui/material"

import { Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { useJobsOverviewContext } from "../JobsOverviewContext"

const styles = sxStyles({
   root: {
      width: "339px",
      minHeight: "80vh",
      borderRadius: 2,
      border: "1px solid #E0E0E0",
      padding: 2,
   },
})

export const CustomJobsOverviewList = () => {
   const { customJobs, setSelectedJob } = useJobsOverviewContext()

   return (
      <Stack sx={styles.root} spacing={2}>
         <Typography>Custom jobs overview list</Typography>
         <Stack spacing={1}>
            {/* TODO: Replace with new Job Card */}
            {customJobs.map((job) => (
               <Typography
                  key={job.id}
                  onClick={() => {
                     setSelectedJob(job)
                  }}
               >
                  {job.title}
               </Typography>
            ))}
         </Stack>
      </Stack>
   )
}
