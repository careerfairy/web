import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, Grid, Stack, Tooltip, Typography, useTheme } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useCallback } from "react"
import {
   AlertCircle,
   Briefcase,
   CheckCircle,
   Globe,
   User,
   Zap,
} from "react-feather"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"
import JobMenu from "../JobMenu"

const styles = sxStyles({
   jobState: {
      display: "flex",
      borderRadius: "16px 0 0 16px",
      p: "8px",
   },
   listItemContainer: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      borderRadius: "16px",
      background: "white",
      border: "1px solid #ECECEC",
   },
   itemWrapper: {
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      width: "100%",
      maxWidth: "calc(100% - 8px)",
      p: { md: 2 },
   },
   infoWrapper: {
      p: { xs: 2, md: 0 },
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
      mt: 2,
   },
   mobileHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "end",
   },
   statsWrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "end",
      px: { xs: 1.5, md: 0 },
      pb: { xs: 1.5, md: 0 },
   },
   stats: (theme) => ({
      background: theme.brand.white[300],
      border: theme.brand.white[400],
      borderRadius: "62px",
      p: "12px 20px",
      alignItems: "center",
      justifyContent: "space-between",
   }),
   mobileStats: (theme) => ({
      display: "flex",
      flexDirection: "column",
      width: "100%",
      background: theme.brand.white[300],
      border: theme.brand.white[400],
      borderRadius: "12px",
      p: 1,
   }),
   mobileStatsValues: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-evenly",
   },
   mobileStatsLabel: {
      display: "flex",
      alignSelf: "center",
      color: "grey",
   },
   statsLabel: {
      color: "grey",
   },
   applications: {
      display: "flex",
      alignItems: "center",

      "& svg": {
         color: "secondary.main",
         mr: 1,
      },
   },
   initialized: {
      display: "flex",
      alignItems: "center",

      "& svg": {
         color: "grey",
         mr: 1,
      },
   },
   editButtonDesktop: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
   tooltip: {
      width: "200px",
      textAlign: "center",
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
   warningContainer: {
      display: "flex",
      alignItems: "center",
   },
})

type Props = {
   job: CustomJob
   clicks?: number
   applicants?: number
   isPreviewMode?: boolean
}

const JobListCard = ({ job, clicks, applicants, isPreviewMode }: Props) => {
   const isMobile = useIsMobile()
   const theme = useTheme()
   // const { jobHubV1 } = useFeatureFlags()
   const { jobHubV1 } = { jobHubV1: true }

   const showAdditionalInfo = clicks !== undefined && applicants !== undefined

   const getStateColor = useCallback(
      (job: CustomJob): string => {
         if (job.published) {
            return theme.palette.primary[300]
         }

         // Job has no content associated to it and it's not expired
         if (isValidButNoLinkedContent(job)) {
            return theme.palette.warning.main
         }

         return theme.brand.black[500]
      },
      [theme]
   )

   return (
      <Grid key={job.id} container>
         <Box sx={styles.listItemContainer}>
            {jobHubV1 ? (
               <Box
                  sx={[styles.jobState, { background: getStateColor(job) }]}
               />
            ) : null}
            <Box sx={styles.itemWrapper}>
               <Grid
                  item
                  xs={12}
                  md={showAdditionalInfo ? 4.5 : 11.5}
                  lg={showAdditionalInfo ? 5.5 : 11.5}
                  sx={styles.infoWrapper}
               >
                  <Box sx={styles.mobileHeader}>
                     <Grid item display={"flex"} xs={11} md={12}>
                        <Typography variant={"h5"} sx={styles.title}>
                           {job.title}
                        </Typography>

                        {jobHubV1 && isValidButNoLinkedContent(job) ? (
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
                                 <Box
                                    component={AlertCircle}
                                    sx={styles.warningAlert}
                                 />
                              </Tooltip>
                           </Box>
                        ) : null}
                     </Grid>

                     {!isPreviewMode && isMobile ? (
                        <JobMenuBlock jobId={job.id} />
                     ) : null}
                  </Box>
                  <Box>
                     <Typography variant={"subtitle1"} sx={styles.subtitle}>
                        {job.jobType ? (
                           <Box sx={styles.subtitleItem}>
                              <Briefcase width={14} />
                              {job.jobType}
                           </Box>
                        ) : null}

                        {job.businessFunctionsTagIds?.length > 0 ? (
                           <Box sx={styles.subtitleItem}>
                              <Zap width={14} />
                              {job.businessFunctionsTagIds.join(", ")}
                           </Box>
                        ) : null}

                        <Box sx={styles.subtitleItem}>
                           <Globe width={14} />
                           {formatJobPostingUrl(job.postingUrl)}
                        </Box>
                     </Typography>

                     <Typography sx={styles.expireDate}>
                        {getDeadLineMessage(job)}
                     </Typography>
                  </Box>
               </Grid>

               {showAdditionalInfo ? (
                  <Grid item xs={12} md={7} lg={6} sx={styles.statsWrapper}>
                     <>
                        {isMobile ? (
                           renderMobileStats(clicks, applicants)
                        ) : (
                           <Stack spacing={2} sx={styles.stats} direction="row">
                              <Typography sx={styles.statsLabel}>
                                 Applications:
                              </Typography>

                              <Box sx={styles.initialized}>
                                 <User size={16} />
                                 <Typography
                                    variant={"subtitle1"}
                                    color={"text.secondary"}
                                 >
                                    {clicks} Initiated
                                 </Typography>
                              </Box>

                              <Box sx={styles.applications}>
                                 <CheckCircle size={16} />
                                 <Typography
                                    variant={"subtitle1"}
                                    color={"secondary.main"}
                                 >
                                    {applicants} Confirmed
                                 </Typography>
                              </Box>
                           </Stack>
                        )}
                     </>
                  </Grid>
               ) : null}
               {isPreviewMode || isMobile ? null : (
                  <JobMenuBlock jobId={job.id} />
               )}
            </Box>
         </Box>
      </Grid>
   )
}

const JobMenuBlock = ({ jobId }) => {
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

const getDeadLineMessage = (job: CustomJob) => {
   const jobDeadlineDateString = DateUtil.formatDateToString(
      job.deadline.toDate()
   )

   if (DateUtil.isDeadlineExpired(job.deadline.toDate())) {
      return `Expired on ${jobDeadlineDateString}`
   }

   return `Application deadline ${jobDeadlineDateString}`
}

const renderMobileStats = (clicks: number, applicants: number) => (
   <Box sx={styles.mobileStats}>
      <Box sx={styles.mobileStatsValues}>
         <Box sx={styles.initialized}>
            <User size={16} />
            <Typography variant={"subtitle1"} color={"text.secondary"}>
               {clicks} Initiated
            </Typography>
         </Box>

         <Box sx={styles.applications}>
            <CheckCircle size={16} />
            <Typography variant={"subtitle1"} color={"secondary.main"}>
               {applicants} Confirmed
            </Typography>
         </Box>
      </Box>
   </Box>
)

const formatJobPostingUrl = (postingUrl: string): string => {
   const withoutProtocol = postingUrl.split("://")[1]
   return withoutProtocol ? withoutProtocol : postingUrl
}

/**
 * Checks if a job has no linked content (live streams or sparks) and if its deadline has not expired.
 *
 */
const isValidButNoLinkedContent = (job: CustomJob): boolean => {
   const jobHasNoContent = job.livestreams.length == 0 && job.sparks.length == 0

   return jobHasNoContent && !DateUtil.isDeadlineExpired(job.deadline.toDate())
}

export default JobListCard
