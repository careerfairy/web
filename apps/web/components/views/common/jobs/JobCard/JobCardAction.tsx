import { Job } from "@careerfairy/shared-lib/ats/Job"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Button, Grid } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import JobMenu from "components/views/group/admin/jobs/JobMenu"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   editButtonDesktop: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
   button: {
      padding: "8px 12px",
   },
   smallButton: {
      fontSize: 12,
      padding: 0,
   },
   mobileBtnWrapper: {
      display: "flex",
      justifyContent: "end",
      alignItems: "center",
   },
})

type Props = {
   job: Job | CustomJob
   previewMode: boolean
}

const JobCardAction = ({ job, previewMode }: Props) => {
   const jobPublished = (job as CustomJob)?.published ?? true

   if (previewMode) {
      return <JobButtonAction published={jobPublished} />
   }

   return <JobMenuAction jobId={job.id} />
}

export const JobMenuAction = ({ jobId }) => {
   const isMobile = useIsMobile()
   return (
      <Grid
         item
         xs={1}
         md={0.5}
         height={25}
         sx={isMobile ? null : styles.editButtonDesktop}
      >
         <JobMenu jobId={jobId} />
      </Grid>
   )
}

export const JobButtonAction = ({ published, smallCard = false }) => {
   const isMobile = useIsMobile() || smallCard

   const button = (
      <Button
         variant={published && !isMobile ? "contained" : "text"}
         color={published ? "primary" : "grey"}
         sx={[isMobile ? styles.smallButton : styles.button]}
      >
         Check details
      </Button>
   )

   return isMobile ? (
      button
   ) : (
      <Grid item xs={1} md={3} lg={2.5} sx={styles.mobileBtnWrapper}>
         {button}
      </Grid>
   )
}

export default JobCardAction
