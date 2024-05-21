import { Job } from "@careerfairy/shared-lib/ats/Job"
import { PublicCustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import CloseIcon from "@mui/icons-material/Close"
import { LoadingButton } from "@mui/lab"
import {
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Stack,
} from "@mui/material"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import { useAuth } from "HOCs/AuthProvider"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useLivestreamCompanyHostSWR from "components/custom-hook/live-stream/useLivestreamCompanyHostSWR"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import useIsAtsJob from "components/custom-hook/useIsAtsJob"
import useIsMobile from "components/custom-hook/useIsMobile"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { JobButton } from "components/views/livestream-dialog/views/job-details/JobDetailsView"
import CustomJobApplyConfirmation from "components/views/livestream-dialog/views/job-details/main-content/CustomJobApplyConfirmation"
import JobDescription from "components/views/livestream-dialog/views/job-details/main-content/JobDescription"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useState } from "react"
import { Briefcase } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import { JobDialogSkeleton } from "./JobDialogSkeleton"

const styles = sxStyles({
   dialogTitle: {
      padding: "16px 16px 2px 0",
   },
   title: {
      display: "flex",
      justifyContent: "flex-end",
   },
   closeButton: {
      width: "32px",
      height: "32px",
      flexShrink: 0,
   },
   header: {
      display: "flex",
      padding: 1.5,
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-start",
      gap: 1.5,
      alignSelf: "stretch",
      borderRadius: "8px",
      background: (theme) => theme.brand.white[400],
   },
   companyName: {
      flex: "1 0 0",
      color: (theme) => theme.palette.neutral[800],
      fontWeight: 600,
      alignContent: "center",
   },
   jobName: {
      fontWeight: 700,
      color: "#393939",
   },
   jobIconWrapper: {
      display: "flex",
      alignItems: "center",
      gap: 0.75,
      alignSelf: "stretch",
      color: (theme) => theme.palette.neutral[500],
   },
   dialogActions: (theme) => ({
      display: "flex",
      padding: 2,
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 1.25,
      borderTop: `1px solid ${theme.brand.black[300]}`,
      background: theme.brand.white[200],
   }),
})

type Props = {
   job: Job | PublicCustomJob
   handleDialogClose: () => unknown
   livestreamId: string
   open: boolean
}

const JobDialog = ({ job, handleDialogClose, livestreamId, open }: Props) => {
   const isMobile = useIsMobile()
   const [isOpen, handleOpen, handleClose] = useDialogStateHandler()
   const { isHost } = useStreamingContext()

   return (
      <Dialog
         open={open}
         onClose={handleDialogClose}
         maxWidth={"md"}
         fullWidth
         fullScreen={isMobile}
      >
         <DialogTitle sx={styles.dialogTitle}>
            <Box sx={styles.title}>
               <IconButton
                  color="inherit"
                  onClick={handleDialogClose}
                  aria-label="close"
                  sx={styles.closeButton}
               >
                  <CloseIcon />
               </IconButton>
            </Box>
         </DialogTitle>
         <DialogContent>
            <SuspenseWithBoundary fallback={<JobDialogSkeleton />}>
               <JobDialogContent
                  job={job}
                  livestreamId={livestreamId}
                  isConfirmationDialogOpen={isOpen}
                  handleCloseConfirmationDialog={handleClose}
               />
            </SuspenseWithBoundary>
         </DialogContent>
         <SuspenseWithBoundary fallback={<></>}>
            {!isHost && (
               <DialogActions sx={styles.dialogActions}>
                  <JobDialogActions
                     job={job}
                     livestreamId={livestreamId}
                     handleOpenConfirmationDialog={handleOpen}
                  />
               </DialogActions>
            )}
         </SuspenseWithBoundary>
      </Dialog>
   )
}

const JobDialogContent = ({
   job,
   livestreamId,
   isConfirmationDialogOpen,
   handleCloseConfirmationDialog,
}) => {
   const { data: hostCompany } = useLivestreamCompanyHostSWR(livestreamId)

   const isAtsJob = useIsAtsJob(job)
   let jobName: string, jobDepartment: string

   if (isAtsJob) {
      jobName = job.name
      jobDepartment = job.getDepartment()
   } else {
      jobName = job.title
      jobDepartment = job.jobType
   }

   return (
      <Stack spacing={3}>
         <Stack sx={styles.header}>
            <Stack direction="row" spacing={1}>
               <CircularLogo
                  alt={`company ${hostCompany} avatar`}
                  src={hostCompany.logoUrl}
                  size={40}
               />
               <Typography variant={"brandedBody"} sx={styles.companyName}>
                  {hostCompany.universityName}
               </Typography>
            </Stack>

            <Stack spacing={0.5}>
               <Typography variant={"brandedH3"} sx={styles.jobName}>
                  {jobName}
               </Typography>
               <Box gap={2}>
                  {jobDepartment ? (
                     <Box sx={styles.jobIconWrapper}>
                        <Box component={Briefcase} size={12} />
                        <Typography variant={"small"}>
                           {jobDepartment}
                        </Typography>
                     </Box>
                  ) : null}
                  {/* TODO: Add job business function */}
                  {/* <Box sx={styles.jobIconWrapper}>
                        <Box component={Zap} size={12} />
                        <Typography variant="small">
                           Business Function
                        </Typography>
                     </Box> */}
               </Box>
            </Stack>
         </Stack>
         <Stack spacing={2}>
            <JobDescription job={job} />
         </Stack>
         {isConfirmationDialogOpen && !isAtsJob ? (
            <CustomJobApplyConfirmation
               handleClose={handleCloseConfirmationDialog}
               job={job as PublicCustomJob}
               livestreamId={livestreamId}
            />
         ) : null}
      </Stack>
   )
}

const JobDialogActions = ({
   job,
   livestreamId,
   handleOpenConfirmationDialog,
}) => {
   const isAtsJob = useIsAtsJob(job)
   const [isSendingEmail, setIsSendingEmail] = useState(false)
   const firebaseService = useFirebaseService()
   const { userData, authenticatedUser } = useAuth()
   const { errorNotification, successNotification } = useSnackbarNotifications()

   const sendEmailReminderForApplication = async () => {
      setIsSendingEmail(true)
      try {
         await firebaseService.sendReminderEmailAboutApplicationLink({
            recipient: authenticatedUser.email,
            recipient_name: userData.firstName,
            position_name: job.title,
            application_link: job.postingUrl,
         })
         successNotification(
            "We just sent you an email so that you can complete your application after this live stream."
         )
      } catch (error) {
         errorNotification(error)
      } finally {
         setIsSendingEmail(false)
      }
   }
   return (
      <>
         <JobButton
            job={job}
            handleOpen={handleOpenConfirmationDialog}
            isSecondary={!isAtsJob}
            livestreamId={livestreamId}
         />
         {!isAtsJob && (
            <>
               <LoadingButton
                  variant="contained"
                  loading={isSendingEmail}
                  onClick={sendEmailReminderForApplication}
               >
                  Send email reminder
               </LoadingButton>
            </>
         )}
      </>
   )
}

export default JobDialog
