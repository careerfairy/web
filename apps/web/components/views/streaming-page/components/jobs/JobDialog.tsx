import { Job } from "@careerfairy/shared-lib/ats/Job"
import {
   CustomJobApplicationSourceTypes,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import CloseIcon from "@mui/icons-material/Close"
import { LoadingButton } from "@mui/lab"
import {
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Stack,
   SwipeableDrawer,
} from "@mui/material"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import { useAuth } from "HOCs/AuthProvider"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useLivestreamCompanyHostSWR from "components/custom-hook/live-stream/useLivestreamCompanyHostSWR"
import {
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import useIsAtsJob from "components/custom-hook/useIsAtsJob"
import useIsMobile from "components/custom-hook/useIsMobile"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import CircularLogo from "components/views/common/logos/CircularLogo"
import CustomJobApplyConfirmation from "components/views/jobs/components/custom-jobs/CustomJobApplyConfirmation"
import { JobButton } from "components/views/livestream-dialog/views/job-details/JobDetailsView"
import JobDescription from "components/views/livestream-dialog/views/job-details/main-content/JobDescription"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useState } from "react"
import { Briefcase, ChevronLeft } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import { JobDialogSkeleton } from "./JobDialogSkeleton"

const styles = sxStyles({
   dialogTitle: {
      padding: "16px 16px 2px 0",
   },
   dialogTitleMobile: (theme) => ({
      display: "flex",
      padding: "17px 16px",
      position: "sticky",
      top: 0,
      justifyContent: "flex-start",
      alignItems: "center",
      borderRadius: "12px 12px 0px 0px",
      borderBottom: `1px solid ${theme.brand.white[400]}`,
      background: theme.brand.white[100],
      zIndex: 1,
   }),
   title: {
      display: "flex",
      justifyContent: "flex-end",
   },

   closeButton: {
      width: "32px",
      height: "32px",
      flexShrink: 0,
   },
   closeButtonMobile: {
      display: "flex",
      alignItems: "center",
      flexShrink: 0,
      p: 0,
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
      position: "sticky",
      bottom: 0,
      padding: 2,
      justifyContent: "flex-end",
      alignItems: "center",
      borderTop: `1px solid ${theme.brand.black[300]}`,
      background: theme.brand.white[200],
   }),
   dialogActionsContent: {
      gap: 1.25,
      textWrap: "noWrap",
      minWidth: "fit-content",
      alignItems: "center",
   },
   drawer: {
      borderRadius: "12px 12px 0 0",
      maxHeight: "90%",
   },
   drawerContent: {
      display: "flex",
      padding: "0px 16px",
      flexDirection: "column",
   },
   dialogContentWrapper: {
      my: { xs: 2, md: 0 },
   },
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

   if (isMobile) {
      return (
         <MobileDrawer
            job={job}
            livestreamId={livestreamId}
            isConfirmationDialogOpen={isOpen}
            handleCloseConfirmationDialog={handleClose}
            handleOpenConfirmationDialog={handleOpen}
            handleDialogClose={handleDialogClose}
            open={open}
         />
      )
   }

   return (
      <Dialog
         open={open}
         onClose={handleDialogClose}
         maxWidth={"md"}
         fullWidth
         disableEnforceFocus
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

const MobileDrawer = ({
   job,
   livestreamId,
   isConfirmationDialogOpen,
   handleCloseConfirmationDialog,
   handleOpenConfirmationDialog,
   handleDialogClose,
   open,
}) => {
   const { isHost } = useStreamingContext()

   return (
      <SwipeableDrawer
         onClose={handleDialogClose}
         open={open}
         anchor="bottom"
         PaperProps={{
            sx: styles.drawer,
         }}
         onOpen={() => {}}
         disableEnforceFocus
      >
         <Box sx={styles.dialogTitleMobile}>
            <IconButton
               color="inherit"
               onClick={handleDialogClose}
               aria-label="close"
               sx={styles.closeButtonMobile}
            >
               <ChevronLeft size={24} />
            </IconButton>
         </Box>
         <Box sx={styles.drawerContent}>
            <JobDialogContent
               job={job}
               livestreamId={livestreamId}
               isConfirmationDialogOpen={isConfirmationDialogOpen}
               handleCloseConfirmationDialog={handleCloseConfirmationDialog}
            />
         </Box>
         {!isHost && (
            <Box sx={styles.dialogActions}>
               <JobDialogActions
                  job={job}
                  livestreamId={livestreamId}
                  handleOpenConfirmationDialog={handleOpenConfirmationDialog}
               />
            </Box>
         )}
      </SwipeableDrawer>
   )
}

const JobDialogContent = ({
   job,
   livestreamId,
   isConfirmationDialogOpen,
   handleCloseConfirmationDialog,
}) => {
   const { data: hostCompany } = useLivestreamCompanyHostSWR(livestreamId)
   const isMobile = useStreamIsMobile()
   const isLandscape = useStreamIsLandscape()

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
      <Stack spacing={3} sx={styles.dialogContentWrapper}>
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
               applicationSource={{
                  id: livestreamId,
                  source: CustomJobApplicationSourceTypes.Livestream,
               }}
               sx={{
                  bottom:
                     isMobile && !isLandscape ? { xs: "130px", sm: "90px" } : 0,
               }}
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
   const { authenticatedUser } = useAuth()
   const { errorNotification, successNotification } = useSnackbarNotifications()

   const sendEmailReminderForApplication = async () => {
      setIsSendingEmail(true)
      try {
         await firebaseService.sendReminderEmailAboutApplicationLink({
            userEmail: authenticatedUser.email,
            userUid: authenticatedUser.uid,
            jobId: job.id,
            livestreamId: livestreamId,
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
      <Stack
         direction={
            !isAtsJob && {
               xs: "column-reverse",
               sm: "row",
            }
         }
         width={
            !isAtsJob && {
               xs: "100%",
               sm: "unset",
            }
         }
         sx={[styles.dialogActionsContent]}
      >
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
                  fullWidth
                  loading={isSendingEmail}
                  onClick={sendEmailReminderForApplication}
                  sx={styles.dialogActionsContent}
               >
                  Send email reminder
               </LoadingButton>
            </>
         )}
      </Stack>
   )
}

export default JobDialog
