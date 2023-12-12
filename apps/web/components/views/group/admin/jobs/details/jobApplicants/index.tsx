import { Box, Grid, Typography } from "@mui/material"
import { sxStyles } from "../../../../../../../types/commonTypes"
import { UserData } from "@careerfairy/shared-lib/users"
import { CustomJob } from "@careerfairy/shared-lib/groups/customJobs"
import React, { FC } from "react"
import JobApplicantsList from "./JobApplicantsList"

const styles = sxStyles({
   statsSection: {
      display: "flex",
      flexDirection: "column",
      px: 2,
      py: 1,
      borderRadius: 2,
      background: "white",
      border: "1px solid #F0EDFD",
   },
   statsLabel: {
      fontSize: "14px",
   },
   statsValue: {
      fontSize: "20px",
      fontWeight: "bold",
   },
})

type Props = {
   job: CustomJob
   applicants: UserData[]
}

const JobApplicants: FC<Props> = ({ job, applicants }) => {
   return (
      <>
         <Grid container spacing={1}>
            <Grid item xs={6}>
               <Box sx={styles.statsSection}>
                  <Typography
                     variant={"subtitle1"}
                     color={"grey"}
                     sx={styles.statsLabel}
                  >
                     Total clicks
                  </Typography>
                  <Typography variant={"body1"} sx={styles.statsValue}>
                     {job.clicks}
                  </Typography>
               </Box>
            </Grid>

            <Grid item xs={6}>
               <Box sx={styles.statsSection}>
                  <Typography
                     variant={"subtitle1"}
                     color={"grey"}
                     sx={styles.statsLabel}
                  >
                     Applications
                  </Typography>
                  <Typography variant={"body1"} sx={styles.statsValue}>
                     {job.applicants?.length || 0}
                  </Typography>
               </Box>
            </Grid>
         </Grid>

         <JobApplicantsList applicants={applicants} />
      </>
   )
}

export default JobApplicants
