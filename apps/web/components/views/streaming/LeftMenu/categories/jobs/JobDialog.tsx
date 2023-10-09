import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import { useAuth } from "../../../../../../HOCs/AuthProvider"
import { useCurrentStream } from "../../../../../../context/stream/StreamContext"
import React, { useMemo, useState } from "react"
import Box from "@mui/material/Box"
import Link from "../../../../common/Link"
import { SuspenseWithBoundary } from "../../../../../ErrorBoundary"
import JobEntryApply from "./JobEntryApply"
import Typography from "@mui/material/Typography"
import {
   Avatar,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Stack,
} from "@mui/material"
import { sxStyles } from "../../../../../../types/commonTypes"
import { PublicCustomJob } from "@careerfairy/shared-lib/groups/customJobs"
import useIsMobile from "../../../../../custom-hook/useIsMobile"
import CloseIcon from "@mui/icons-material/Close"
import IconButton from "@mui/material/IconButton"
import { getResizedUrl } from "../../../../../helperFunctions/HelperFunctions"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import DateUtil from "../../../../../../util/DateUtil"
import CvUploadSection from "./CvUploadSection"
import CollapsableText from "../../../../common/inputs/CollapsableText"
import useIsAtsJob from "../../../../../custom-hook/useIsAtsJob"
import CustomJobEntryApply from "./CustomJobEntryApply"

const styles = sxStyles({
   header: {
      display: "flex",
      ml: 2,
   },
   headerLeftSide: {
      display: "flex",
      width: "100%",
      alignItems: "center",
      mt: { xs: 4, md: 2 },
   },
   headerContent: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "8px",
      ml: 4,
   },
   jobName: {
      fontWeight: "bold",
   },
   jobType: {
      color: "#8B8B8B",
      fontSize: "16px",
   },
   subTitle: {
      fontSize: "20px",
      fontWeight: "bold",
   },
   jobValues: {
      fontSize: "16px",
   },
   userMessage: {
      fontSize: "16px",
      fontWeight: "bold",
   },
   content: {
      mt: { xs: 4, md: 2 },
      mx: 2,
      mb: 2,
      height: { xs: "none", md: "420px" },
      overflow: "scroll",
      pb: 2,
   },
   actions: {
      borderTop: "1px solid #F1F1F1",
      py: 2,
      pr: 4,
   },
   companyAvatar: {
      width: 63,
      height: 63,
      background: (theme) => theme.palette.common.white,
      boxShadow: (theme) => theme.shadows[2],

      "& img": {
         objectFit: "contain",
         maxWidth: "90%",
         maxHeight: "90%",
      },
   },
   bottomSection: {
      height: "100%",
      display: "flex",
      alignItems: "flex-end",
   },
})

type Props = {
   job: Job | PublicCustomJob
   handleClose: () => any
   livestream: LivestreamEvent
   open: boolean
}

const JobDialog = ({ job, handleClose, livestream, open }: Props) => {
   const { userData } = useAuth()
   const { isStreamer } = useCurrentStream()
   const isAtsJob = useIsAtsJob(job)
   const isMobile = useIsMobile()
   const [alreadyApplied, setAlreadyApplied] = useState(false)

   let hiringManager: string,
      jobName: string,
      jobType: string,
      jobSalary: string,
      jobDeadline: string

   if (isAtsJob) {
      hiringManager = job.getHiringManager()
      jobName = job.name
   } else {
      jobName = job.title
      jobType = job.jobType
      jobSalary = job.salary
      jobDeadline = job.deadline
         ? DateUtil.formatDateToString(job.deadline.toDate())
         : ""
   }

   const renderNeedsLogin = useMemo(
      () => (
         <Box display="flex">
            <Typography variant="body1" sx={styles.userMessage} mr={1}>
               You need to sign in to be able to apply to jobs.
            </Typography>
            <Link
               href={`/login?absolutePath=/streaming/${livestream.id}/viewer`}
            >
               <Typography variant="body1" sx={styles.userMessage}>
                  Sign In
               </Typography>
            </Link>
         </Box>
      ),
      [livestream.id]
   )

   const renderApplyButton = useMemo((): JSX.Element => {
      if (isAtsJob) {
         return (
            <Box mr={4}>
               <SuspenseWithBoundary>
                  <JobEntryApply
                     job={job}
                     livestreamId={livestream.id}
                     isApplied={alreadyApplied}
                     handleAlreadyApply={setAlreadyApplied}
                  />
               </SuspenseWithBoundary>
            </Box>
         )
      }

      if (!Boolean(userData)) {
         return renderNeedsLogin
      }

      return (
         <Box>
            <SuspenseWithBoundary>
               <CustomJobEntryApply
                  job={job}
                  livestreamId={livestream.id}
                  handleClose={handleClose}
               />
            </SuspenseWithBoundary>
         </Box>
      )
   }, [
      alreadyApplied,
      handleClose,
      isAtsJob,
      job,
      livestream.id,
      renderNeedsLogin,
      userData,
   ])

   return (
      <Dialog
         open={open}
         onClose={handleClose}
         maxWidth={"md"}
         fullWidth
         fullScreen={isMobile}
      >
         <DialogTitle sx={styles.header}>
            <Box sx={styles.headerLeftSide}>
               <Avatar
                  sx={styles.companyAvatar}
                  alt={`company ${livestream.company} avatar`}
                  src={getResizedUrl(livestream?.companyLogoUrl, "xs")}
               />

               <Box sx={styles.headerContent}>
                  <Typography variant={"h4"} sx={styles.jobName}>
                     {jobName}
                  </Typography>
                  {Boolean(jobType) ? (
                     <Typography variant={"subtitle1"} sx={styles.jobType}>
                        {jobType}
                     </Typography>
                  ) : null}
               </Box>
            </Box>
            <Box>
               <IconButton
                  color="inherit"
                  onClick={handleClose}
                  aria-label="close"
               >
                  <CloseIcon />
               </IconButton>
            </Box>
         </DialogTitle>

         <DialogContent sx={styles.content}>
            <Stack spacing={2} sx={{ height: "100%" }}>
               {Boolean(hiringManager) ? (
                  <Box>
                     <Typography variant={"subtitle1"} sx={styles.subTitle}>
                        Hiring Manager
                     </Typography>
                     <Typography variant={"body1"} sx={styles.jobValues}>
                        {hiringManager}
                     </Typography>
                  </Box>
               ) : null}

               <Box>
                  <Typography variant={"subtitle1"} sx={styles.subTitle}>
                     Job description
                  </Typography>
                  <CollapsableText text={job.description} />
               </Box>

               {Boolean(jobSalary) ? (
                  <Box>
                     <Typography variant={"subtitle1"} sx={styles.subTitle}>
                        Salary
                     </Typography>
                     <Typography variant={"body1"} sx={styles.jobValues}>
                        {jobSalary}
                     </Typography>
                  </Box>
               ) : null}

               {Boolean(jobDeadline) ? (
                  <Box>
                     <Typography variant={"subtitle1"} sx={styles.subTitle}>
                        Application deadline
                     </Typography>
                     <Typography variant={"body1"} sx={styles.jobValues}>
                        {jobDeadline}
                     </Typography>
                  </Box>
               ) : null}

               {isAtsJob ? (
                  <Box sx={styles.bottomSection}>
                     <Box mt={2}>
                        {Boolean(userData) ? (
                           <CvUploadSection alreadyApplied={alreadyApplied} />
                        ) : (
                           renderNeedsLogin
                        )}
                     </Box>
                  </Box>
               ) : null}
            </Stack>
         </DialogContent>

         {isStreamer ? null : (
            <DialogActions sx={styles.actions}>
               {renderApplyButton}
            </DialogActions>
         )}
      </Dialog>
   )
}

export default JobDialog
