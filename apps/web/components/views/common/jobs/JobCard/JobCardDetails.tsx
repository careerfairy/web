import { Job } from "@careerfairy/shared-lib/ats/Job"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Timestamp } from "@careerfairy/shared-lib/firebaseTypes"
import { Box, Grid, Tooltip, Typography } from "@mui/material"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import useIsAtsJob from "components/custom-hook/useIsAtsJob"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useMemo } from "react"
import { AlertCircle, Briefcase, Globe, Zap } from "react-feather"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"
import { isJobValidButNoLinkedContent } from "../utils"
import { JobButtonAction, JobMenuAction } from "./JobCardAction"

const styles = sxStyles({
   wrapper: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "end",
   },
   title: {
      color: "text.primary",
      fontWeight: 600,
      fontSize: "16px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      px: { xs: 1, md: 0 },
   },
   warningContainer: {
      display: "flex",
      alignItems: "center",
   },
   tooltipMessage: {
      fontSize: "14px",
      color: "text.secondary",
   },
   warningAlert: {
      ml: 2,
      color: (theme) => theme.palette.warning["600"],
      height: "18px",
      width: "18px",
   },
   tooltip: {
      width: "200px",
      textAlign: "center",
   },
   subtitle: {
      display: { xs: "flex", md: "block" },
      flexDirection: "column",

      fontSize: "14px",
      color: "text.secondary",
      fontWeight: 400,

      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
   },
   subtitleItem: {
      display: "inline",
      alignItems: "center",
      marginRight: 2,

      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",

      "& svg": {
         verticalAlign: "bottom",
         marginRight: "6px",
      },
   },
   expireDate: {
      fontSize: "12px",
      fontWeight: 400,
      color: (theme) => theme.palette.neutral[300],
   },
   smallTitle: {
      fontSize: "16px !important",
   },
   smallSubtitle: {
      display: "flex !important",
      fontSize: "14px !important",

      "& svg": {
         verticalAlign: "bottom",
         marginRight: "4px",
      },
   },
   smallExpiredDate: {
      fontSize: "12px !important",
   },
})

type Props = {
   job: Job | CustomJob
   previewMode: boolean
   smallCard: boolean
}

const JobCardDetails = ({ job, previewMode, smallCard }: Props) => {
   const isAtsJob = useIsAtsJob(job)
   const isMobile = useIsMobile()
   const { jobHubV1 } = useFeatureFlags()

   let jobName: string
   let jobType: string
   let jobDeadline: Timestamp
   let jobPostingUrl: string
   let jobPublished: boolean
   let jobBusinessTags: string | string[]
   let jobIsPermanentlyExpired: boolean

   if (isAtsJob) {
      jobName = job.name
      jobType = job.getDepartment()
   } else {
      jobName = job.title
      jobType = job.jobType
      jobDeadline = job.deadline
      jobPostingUrl = job.postingUrl
      jobPublished = job.published
      jobBusinessTags = job.businessFunctionsTagIds?.join(", ")
      jobIsPermanentlyExpired = job.isPermanentlyExpired
   }

   const showTooltip = useMemo(
      () => !isAtsJob && isJobValidButNoLinkedContent(job) && jobHubV1,
      [isAtsJob, job, jobHubV1]
   )

   return (
      <>
         <Box sx={styles.wrapper}>
            <Grid item display={"flex"} xs={11} md={12}>
               <Typography
                  variant={"h5"}
                  sx={[styles.title, smallCard ? styles.smallTitle : null]}
               >
                  {jobName}
               </Typography>

               {showTooltip ? (
                  <Box sx={styles.warningContainer}>
                     <Tooltip
                        title={
                           <Typography sx={styles.tooltipMessage}>
                              No content linked to this job opening
                           </Typography>
                        }
                        placement="top"
                        componentsProps={{
                           tooltip: {
                              sx: styles.tooltip,
                           },
                        }}
                     >
                        <Box component={AlertCircle} sx={styles.warningAlert} />
                     </Tooltip>
                  </Box>
               ) : null}
            </Grid>

            {isMobile && !previewMode ? (
               <JobMenuAction
                  jobId={job.id}
                  notEditable={jobIsPermanentlyExpired}
               />
            ) : null}
         </Box>
         <Box>
            <Typography
               variant={"subtitle1"}
               sx={[styles.subtitle, smallCard ? styles.smallSubtitle : null]}
            >
               {jobType ? (
                  <Box sx={styles.subtitleItem}>
                     <Briefcase width={smallCard ? 12 : 14} />
                     {jobType}
                  </Box>
               ) : null}

               {jobBusinessTags ? (
                  <Box sx={styles.subtitleItem}>
                     <Zap width={smallCard ? 12 : 14} />
                     {jobBusinessTags}
                  </Box>
               ) : null}

               <Box sx={styles.subtitleItem}>
                  <Globe width={smallCard ? 12 : 14} />
                  {formatJobPostingUrl(jobPostingUrl)}
               </Box>
            </Typography>

            <Box
               sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 1,
                  alignItems: "center",
               }}
            >
               {jobDeadline ? (
                  <Typography
                     sx={[
                        styles.expireDate,
                        smallCard ? styles.smallExpiredDate : null,
                     ]}
                  >
                     {getDeadLineMessage(jobDeadline, previewMode)}
                  </Typography>
               ) : null}

               {(isMobile || smallCard) && previewMode ? (
                  <JobButtonAction
                     published={jobPublished}
                     smallCard={smallCard}
                  />
               ) : null}
            </Box>
         </Box>
      </>
   )
}

const getDeadLineMessage = (jobDeadline: Timestamp, previewMode: boolean) => {
   const deadlineText = DateUtil.formatDateToString(jobDeadline.toDate())

   if (DateUtil.isDeadlineExpired(jobDeadline.toDate())) {
      return previewMode ? "Job expired" : `Expired on ${deadlineText}`
   }

   return previewMode
      ? `Apply until ${deadlineText}`
      : `Application deadline ${deadlineText}`
}

const formatJobPostingUrl = (postingUrl: string): string => {
   const withoutProtocol = postingUrl.split("://")[1]
   return withoutProtocol ? withoutProtocol : postingUrl
}

export default JobCardDetails
