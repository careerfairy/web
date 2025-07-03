import { Job } from "@careerfairy/shared-lib/ats/Job"
import { TagValuesLookup } from "@careerfairy/shared-lib/constants/tags"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Timestamp } from "@careerfairy/shared-lib/firebaseTypes"
import { Box, Grid, SxProps, Tooltip, Typography } from "@mui/material"
import { DefaultTheme } from "@mui/styles/defaultTheme"
import { useAuth } from "HOCs/AuthProvider"
import { useCustomJobLocation } from "components/custom-hook/custom-job/useCustomJobLocation"
import useUserJobApplication from "components/custom-hook/custom-job/useUserJobApplication"
import useIsAtsJob from "components/custom-hook/useIsAtsJob"
import useIsMobile from "components/custom-hook/useIsMobile"
import { BrandedTooltip } from "components/views/streaming-page/components/BrandedTooltip"
import { DateTime } from "luxon"
import { useMemo } from "react"
import { AlertCircle, Briefcase, Globe, MapPin, Zap } from "react-feather"
import { combineStyles, sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"
import { isJobValidButNoLinkedContent } from "../utils"
import { JobButtonAction, JobMenuAction } from "./JobCardAction"

const styles = sxStyles({
   wrapper: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "end",
      mb: 0.5,
   },
   title: {
      color: "text.primary",
      fontWeight: 600,
      fontSize: "16px !important",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
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
      color: (theme) => theme.palette.neutral[500],
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
   companyName: {
      fontFamily: "Poppins",
      fontWeight: 400,
   },
   companyNameWrapper: {
      mt: "4px",
      mb: "4px",
   },
   companyNameWrapperMobile: {
      mt: "4px",
      mb: "8px",
   },
})

type Props = {
   job: Job | CustomJob
   previewMode: boolean
   smallCard: boolean
   hideJobUrl?: boolean
   titleSx?: SxProps<DefaultTheme>
   typographySx?: SxProps<DefaultTheme>
   companyName?: string
   hideCompanyName?: boolean
}

const JobCardDetails = ({
   job,
   previewMode,
   smallCard,
   hideJobUrl,
   titleSx,
   typographySx,
   companyName,
   hideCompanyName,
}: Props) => {
   const { userData } = useAuth()
   const isAtsJob = useIsAtsJob(job)
   const isMobile = useIsMobile()

   const jobApplication = useUserJobApplication(userData?.id, job.id)

   const {
      locationText: jobLocation,
      othersCount,
      otherLocations,
      workplaceText,
   } = useCustomJobLocation(job as CustomJob, {
      maxLocationsToShow: isMobile ? 1 : 3,
   })

   const showWarning = useMemo(
      () => !isAtsJob && isJobValidButNoLinkedContent(job),
      [isAtsJob, job]
   )

   let jobName: string
   let jobType: string
   let jobDeadline: Timestamp
   let jobPostingUrl: string
   let jobPublished: boolean
   let jobBusinessTags: string
   let jobIsPermanentlyExpired: boolean

   if (isAtsJob) {
      jobName = job.name
      jobType = job.getDepartment()
   } else {
      jobName = job?.title
      jobType = job?.jobType
      jobDeadline = job?.deadline
      jobPostingUrl = job?.postingUrl
      jobPublished = job?.published
      jobBusinessTags = (job?.businessFunctionsTagIds || [])
         .map((tagId) => TagValuesLookup[tagId])
         .join(", ")

      jobIsPermanentlyExpired = job?.isPermanentlyExpired
   }

   const published = jobPublished || jobApplication.alreadyApplied

   return (
      <>
         <Box sx={styles.wrapper}>
            <Grid item display={"flex"} xs={11} md={12}>
               <Typography
                  variant={"h5"}
                  sx={combineStyles(
                     [styles.title, smallCard ? styles.smallTitle : null],
                     titleSx
                  )}
               >
                  {jobName}
               </Typography>
               {showWarning ? (
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
                  editable={!jobIsPermanentlyExpired}
               />
            ) : null}
         </Box>
         {companyName && !hideCompanyName ? (
            <Box
               sx={
                  isMobile
                     ? styles.companyNameWrapperMobile
                     : styles.companyNameWrapper
               }
            >
               <Typography
                  variant={"xsmall"}
                  sx={styles.companyName}
                  color="neutral.500"
               >
                  {companyName}
               </Typography>
            </Box>
         ) : null}
         <Box>
            <Typography
               variant={"subtitle1"}
               sx={combineStyles(
                  styles.subtitle,
                  smallCard ? styles.smallSubtitle : null,
                  typographySx
               )}
            >
               {jobType ? (
                  <Box sx={styles.subtitleItem}>
                     <Briefcase width={smallCard ? 12 : 14} />
                     {jobType}
                  </Box>
               ) : null}

               {jobBusinessTags.length ? (
                  <Box sx={styles.subtitleItem}>
                     <Zap width={smallCard ? 12 : 14} />
                     {jobBusinessTags}
                  </Box>
               ) : null}

               {jobLocation ? (
                  <Box sx={styles.subtitleItem}>
                     <MapPin width={smallCard ? 12 : 14} />
                     {jobLocation}
                     {othersCount ? (
                        <BrandedTooltip
                           title={otherLocations
                              .map((location) => location.name)
                              .join(", ")}
                           wrapperStyles={{
                              display: "inline",
                           }}
                        >
                           <Typography
                              variant={"subtitle1"}
                              sx={{ display: "inline", ml: "0px !important" }}
                           >{`, +${othersCount}`}</Typography>
                        </BrandedTooltip>
                     ) : null}
                     {workplaceText ? (
                        <Typography
                           variant={"subtitle1"}
                           sx={{ display: "inline", ml: "0px !important" }}
                        >{`${workplaceText}`}</Typography>
                     ) : null}
                  </Box>
               ) : null}
               {!hideJobUrl ? (
                  <Box sx={styles.subtitleItem}>
                     <Globe width={smallCard ? 12 : 14} />
                     {formatJobPostingUrl(jobPostingUrl)}
                  </Box>
               ) : null}
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
                     {jobApplication.alreadyApplied &&
                     jobApplication?.job?.appliedAt
                        ? getJobApplicationDateText(
                             jobApplication.job.appliedAt.toDate()
                          )
                        : getDeadLineMessage(jobDeadline, previewMode)}
                  </Typography>
               ) : null}

               {(isMobile || smallCard) && previewMode ? (
                  <JobButtonAction
                     published={published}
                     smallCard={smallCard}
                  />
               ) : null}
            </Box>
         </Box>
      </>
   )
}

const getJobApplicationDateText = (applicationDate: Date): string => {
   if (!applicationDate) return ""

   const deadline = DateTime.fromJSDate(applicationDate)
   const now = DateTime.now()

   const diff = now
      .diff(deadline, ["days", "weeks", "months", "years"])
      .toObject()

   if (diff.years > 0) {
      return `Applied ${Math.floor(diff.years)} year${
         Math.floor(diff.years) > 1 ? "s" : ""
      } ago`
   }

   if (diff.months > 0) {
      return `Applied ${Math.floor(diff.months)} month${
         Math.floor(diff.months) > 1 ? "s" : ""
      } ago`
   }

   if (diff.weeks > 0 && diff.months < 1) {
      return `Applied ${Math.floor(diff.weeks)} week${
         Math.floor(diff.weeks) > 1 ? "s" : ""
      } ago`
   }

   if (diff.days > 1 && diff.weeks < 1) {
      return `Applied ${Math.floor(diff.days)} day${
         Math.floor(diff.days) > 1 ? "s" : ""
      } ago`
   }

   return "Applied today"
}

const getDeadLineMessage = (jobDeadline: Timestamp, previewMode: boolean) => {
   const deadlineText =
      (jobDeadline && DateUtil.formatDateToString(jobDeadline.toDate())) ||
      "{no deadline set}"

   if (jobDeadline && DateUtil.isDeadlineExpired(jobDeadline.toDate())) {
      return previewMode ? "Job expired" : `Expired on ${deadlineText}`
   }

   return previewMode
      ? `Apply until ${deadlineText}`
      : `Application deadline ${deadlineText}`
}

const formatJobPostingUrl = (postingUrl: string): string => {
   const withoutProtocol =
      postingUrl?.includes("://") && postingUrl.split("://")?.at(1)
   return withoutProtocol ? withoutProtocol : postingUrl
}

export default JobCardDetails
