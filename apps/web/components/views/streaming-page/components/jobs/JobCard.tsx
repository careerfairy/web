import { Job } from "@careerfairy/shared-lib/ats/Job"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, ButtonBase, Stack, Typography } from "@mui/material"
import useIsAtsJob from "components/custom-hook/useIsAtsJob"
import { useCallback } from "react"
import { Briefcase } from "react-feather"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"
import { dataLayerEvent } from "util/analyticsUtils"

const styles = sxStyles({
   jobCard: (theme) => ({
      display: "flex",
      alignItems: "center",
      alignSelf: "stretch",
      borderRadius: 2,
      border: `1px solid ${theme.brand.white[500]}`,
      background: theme.brand.white[100],
      overflow: "hidden",
      width: "100%",
      textAlign: "left",
      font: "inherit",
   }),
   jobCardSide: {
      width: "8px",
      alignSelf: "stretch",
      background: (theme) => theme.palette.primary[300],
   },
   jobInfo: {
      display: "flex",
      padding: 1.5,
      flexDirection: "column",
      gap: 1,
      flex: "1 0 0",
      alignSelf: "stretch",
   },
   jobTitle: {
      alignSelf: "stretch",
      color: (theme) => theme.palette.neutral[800],

      fontWeight: 600,
   },
   jobIconsSection: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      spacing: 0.25,
      alignSelf: "stretch",
   },
   jobIconWrapper: {
      display: "flex",
      alignItems: "center",
      gap: 0.75,
      alignSelf: "stretch",
      color: (theme) => theme.palette.neutral[500],
   },
   bottomText: {
      display: "flex",
      alignItems: "center",
      gap: 0.75,
      alignSelf: "stretch",
      color: (theme) => theme.palette.neutral[300],
   },
   applyText: {
      display: "flex",
      height: "24px",
      flexDirection: "column",
      justifyContent: "center",
      flex: "1 0 0",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
   },
   seeMore: {
      overflow: "hidden",
      textAlign: "right",
      textOverflow: "ellipsis",
      color: (theme) => theme.palette.primary.main,
   },
})

type Props = {
   job: Job | CustomJob
   handleSelectJob: (job: Job | CustomJob) => void
}

const JobCard = ({ job, handleSelectJob }: Props) => {
   const isAtsJob = useIsAtsJob(job)
   let jobName, jobType, jobDeadline: string

   if (isAtsJob) {
      jobName = job.name
      jobType = job.getDepartment()
   } else {
      jobName = job.title
      jobType = job.jobType
      jobDeadline = job.deadline
         ? DateUtil.formatDateToString(job.deadline.toDate())
         : ""
   }

   const handleClick = useCallback(() => {
      handleSelectJob(job)
      dataLayerEvent("livestream_job_open", {
         jobId: job.id,
         jobName: jobName,
      })
   }, [handleSelectJob, job, jobName])

   return (
      <ButtonBase onClick={handleClick} sx={styles.jobCard}>
         <Box sx={styles.jobCardSide} />
         <Box sx={styles.jobInfo}>
            <Stack spacing={1}>
               <Stack>
                  <Typography variant="brandedBody" sx={styles.jobTitle}>
                     {jobName}
                  </Typography>
                  <Stack sx={styles.jobIconsSection}>
                     {jobType ? (
                        <Box sx={styles.jobIconWrapper}>
                           <Box component={Briefcase} size={12} />
                           <Typography variant="small">{jobType}</Typography>
                        </Box>
                     ) : null}
                     {/* TODO: Add job business function */}
                     {/* <Box sx={styles.jobIconWrapper}>
                        <Box component={Zap} size={12} />
                        <Typography variant="small">
                           Business Function
                        </Typography>
                     </Box> */}
                  </Stack>
               </Stack>
               <Box
                  sx={styles.bottomText}
                  justifyContent={jobDeadline ? "center" : "flex-end"}
               >
                  {jobDeadline ? (
                     <Typography variant="xsmall" sx={styles.applyText}>
                        Apply until {jobDeadline}
                     </Typography>
                  ) : null}

                  <Typography sx={styles.seeMore} variant="xsmall">
                     See more
                  </Typography>
               </Box>
            </Stack>
         </Box>
      </ButtonBase>
   )
}

export default JobCard
