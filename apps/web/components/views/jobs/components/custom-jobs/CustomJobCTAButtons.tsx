import {
   CustomJobApplicationSource,
   JobApplicationSource,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, Button, CircularProgress, Stack, useTheme } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useLiveStreamDialog } from "components/views/livestream-dialog"
import useRegistrationHandler from "components/views/livestream-dialog/useRegistrationHandler"
import { FC, useCallback } from "react"

import { useAuth } from "HOCs/AuthProvider"
import useCustomJobApply from "components/custom-hook/custom-job/useCustomJobApply"
import useIsJobExpired from "components/custom-hook/custom-job/useIsJobExpired"
import useUserJobApplication from "components/custom-hook/custom-job/useUserJobApplication"
import { useUserIsRegistered } from "components/custom-hook/live-stream/useUserIsRegistered"

import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { addUtmTagsToLink } from "@careerfairy/shared-lib/utils/utils"
import ActionButton from "components/views/livestream-dialog/views/livestream-details/action-button/ActionButton"
import ActionButtonProvider, {
   useActionButtonContext,
} from "components/views/livestream-dialog/views/livestream-details/action-button/ActionButtonProvider"
import WatchNowButton from "components/views/livestream-dialog/views/livestream-details/action-button/WatchNowButton"
import useRecordingAccess from "components/views/upcoming-livestream/HeroSection/useRecordingAccess"
import { CheckCircle, ExternalLink, XCircle } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   ctaWrapper: {
      display: "flex",
      gap: "10px",
      alignItems: { xs: "center", sm: "flex-end" },
      width: "100%",
   },
   btnWrapper: {
      display: "flex",
      gap: "10px",
      alignItems: { xs: "center", sm: "flex-end" },
      width: "100%",
   },
   btnPrimary: {
      flexDirection: { xs: "column", sm: "row-reverse" },
      justifyContent: { xs: "center", sm: "flex-start" },
   },
   btnSecondary: {
      flexDirection: { xs: "column-reverse", sm: "row" },
      justifyContent: { xs: "center", sm: "flex-end" },
   },
   btn: {
      textTransform: "none",
      p: "8px 24px",
   },
   disabledBtn: {
      whiteSpace: "nowrap",
      "&:disabled": {
         color: (theme) => theme.brand.black[700],
      },
   },
   visitButton: {
      whiteSpace: "nowrap",
      backgroundColor: "transparent",
      color: (theme) => theme.brand.black[700],
      "&:hover": {
         background: (theme) => theme.brand.black[400],
      },
   },
   watchNowBtn: {
      whiteSpace: "nowrap",
      maxWidth: "100%",
   },
   sparkJobCTA: {
      flexDirection: { xs: "column", md: "row-reverse" },
      justifyContent: "center",
      alignItems: "center",
      width: { xs: "100%", md: "auto" },
   },
   noLongerAccepting: {
      fontSize: "16px",
      wordBreak: "keep-all",
      textAlign: "center",
      minWidth: "290px",
   },
   removeJobBtn: {
      color: (theme) => theme.palette.neutral[500],
      borderColor: (theme) => theme.palette.neutral[200],
      backgroundColor: "white",
      whiteSpace: "nowrap",
      "&:hover": {
         borderColor: (theme) => theme.palette.grey[100],
         backgroundColor: (theme) => theme.palette.grey[100],
      },
   },
   haveAppliedBtn: {
      whiteSpace: "nowrap",
   },
})

const UTM_CAMPAIGN = "job"
const UTM_MEDIUM = "paid"

type Props = {
   applicationSource?: CustomJobApplicationSource
   job: PublicCustomJob
   handleApplyClick?: () => void
   handleRemoveClick?: () => void
}

type CustomJobCTAProps = Props & {
   isSecondary?: boolean
   alreadyApplied?: boolean
}

const CustomJobCTAButtons = (props: Props) => {
   const { userData } = useAuth()
   const { alreadyApplied, applicationInitiatedOnly } = useUserJobApplication(
      userData?.id,
      props.job.id
   )

   const ctas: { [source in JobApplicationSource]: FC } = {
      livestream: () => (
         <LivestreamJobCTA {...props} alreadyApplied={alreadyApplied} />
      ),
      spark: () => {
         return <SparkJobCTA {...props} alreadyApplied={alreadyApplied} />
      },
      profile: () => {
         return (
            <ProfileJobCTA
               {...props}
               alreadyApplied={alreadyApplied}
               applicationInitiatedOnly={applicationInitiatedOnly}
            />
         )
      },
      group: () => {
         return <PortalJobCTA {...props} alreadyApplied={alreadyApplied} />
      },
      portal: () => <PortalJobCTA {...props} alreadyApplied={alreadyApplied} />,
      notification: () => {
         return <></>
      },
      levels: () => {
         return <SparkJobCTA {...props} alreadyApplied={alreadyApplied} />
      },
   }

   return ctas[props.applicationSource.source](props)
}

type LivestreamCustomJobCTAProps = CustomJobCTAProps & {
   isUserRegistered?: boolean
}

const LivestreamJobCTA = (props: LivestreamCustomJobCTAProps) => {
   const { livestreamPresenter } = useLiveStreamDialog()
   const isUserRegisteredToEvent = useUserIsRegistered(livestreamPresenter?.id)
   const isPast = (livestreamPresenter as LivestreamPresenter)?.isPast()

   return isPast ? (
      <PastLivestreamJobCTA
         {...props}
         alreadyApplied={props.alreadyApplied}
         isUserRegistered={isUserRegisteredToEvent}
      />
   ) : (
      <UpcomingLivestreamJobCTA
         {...props}
         alreadyApplied={props.alreadyApplied}
         isUserRegistered={isUserRegisteredToEvent}
      />
   )
}

const SparkJobCTA = ({
   applicationSource,
   job,
   handleApplyClick: handleApplyClick,
   alreadyApplied,
   isUserRegistered,
}: LivestreamCustomJobCTAProps) => {
   const jobExpired = useIsJobExpired(job)

   return (
      <Stack sx={[styles.ctaWrapper]}>
         <Stack sx={styles.sparkJobCTA} spacing={2}>
            <CustomJobApplyButton
               job={job as PublicCustomJob}
               applicationSource={applicationSource}
               handleApplyClick={handleApplyClick}
               isSecondary={jobExpired || isUserRegistered}
               alreadyApplied={alreadyApplied}
            />
            <ApplicationAlreadySentButton alreadyApplied={alreadyApplied} />
         </Stack>
      </Stack>
   )
}

const PastLivestreamJobCTA = ({
   applicationSource,
   job,
   handleApplyClick: handleApplyClick,
   alreadyApplied,
   isUserRegistered,
}: LivestreamCustomJobCTAProps) => {
   const isMobile = useIsMobile()
   const { onRegisterClick, userEmailFromServer } = useActionButtonContext()
   const jobExpired = useIsJobExpired(job)
   const { userData } = useAuth()
   const { livestreamPresenter, handleBack } = useLiveStreamDialog()
   const recordingAvailable = useRecordingAccess(
      userData?.id,
      livestreamPresenter
   )
   const onClickWatchRecording = handleBack

   return (
      <Stack sx={[styles.ctaWrapper]}>
         <Stack
            direction={isMobile ? "column" : "row-reverse"}
            justifyContent={"center"}
            alignItems={"center"}
            width={isMobile ? "100%" : "auto"}
            spacing={2}
         >
            <CustomJobApplyButton
               job={job as PublicCustomJob}
               applicationSource={applicationSource}
               handleApplyClick={handleApplyClick}
               isSecondary={jobExpired || isUserRegistered}
               alreadyApplied={alreadyApplied}
            />

            {recordingAvailable.showRecording && livestreamPresenter ? (
               <Box width={isMobile ? "100%" : "auto"}>
                  <ActionButtonProvider
                     isFixedToBottom
                     livestreamPresenter={livestreamPresenter}
                     userEmailFromServer={userEmailFromServer}
                     onRegisterClick={onRegisterClick}
                     showIcon
                     outlined={!jobExpired && !alreadyApplied}
                     onClickWatchRecording={onClickWatchRecording}
                  >
                     <WatchNowButton fullWidth />
                  </ActionButtonProvider>
               </Box>
            ) : null}
            <ApplicationAlreadySentButton alreadyApplied={alreadyApplied} />
            <JobExpiredButton job={job} alreadyApplied={alreadyApplied} />
         </Stack>
      </Stack>
   )
}

const UpcomingLivestreamJobCTA = ({
   applicationSource,
   job,
   handleApplyClick: handleClick,
   alreadyApplied,
   isUserRegistered,
}: LivestreamCustomJobCTAProps) => {
   const isMobile = useIsMobile()
   const { livestreamPresenter } = useLiveStreamDialog()

   return (
      <Stack sx={[styles.ctaWrapper]}>
         <Stack
            direction={isMobile ? "column" : "row-reverse"}
            justifyContent={"center"}
            alignItems={"center"}
            width={isMobile ? "100%" : "auto"}
            spacing={2}
         >
            {!isUserRegistered && livestreamPresenter ? (
               <LiveStreamButton />
            ) : null}
            <CustomJobApplyButton
               job={job as PublicCustomJob}
               applicationSource={applicationSource}
               handleApplyClick={handleClick}
               isSecondary={!isUserRegistered}
               alreadyApplied={alreadyApplied}
            />
            <ApplicationAlreadySentButton alreadyApplied={alreadyApplied} />
            <VisitApplicationPageButton
               job={job}
               alreadyApplied={alreadyApplied}
            />
            <JobExpiredButton job={job} alreadyApplied={alreadyApplied} />
         </Stack>
      </Stack>
   )
}

const PortalJobCTA = ({
   alreadyApplied,
   applicationSource,
   handleApplyClick,
   job,
}: CustomJobCTAProps) => {
   const isMobile = useIsMobile()
   return (
      <Stack sx={[styles.ctaWrapper]}>
         <Stack
            direction={isMobile ? "column" : "row-reverse"}
            justifyContent={"center"}
            alignItems={"center"}
            width={isMobile ? "100%" : "auto"}
            spacing={2}
         >
            <CustomJobApplyButton
               job={job as PublicCustomJob}
               applicationSource={applicationSource}
               handleApplyClick={handleApplyClick}
               isSecondary={false}
               alreadyApplied={alreadyApplied}
            />
            <ApplicationAlreadySentButton alreadyApplied={alreadyApplied} />
            <VisitApplicationPageButton
               job={job}
               alreadyApplied={alreadyApplied}
            />
            <JobExpiredButton job={job} alreadyApplied={alreadyApplied} />
         </Stack>
      </Stack>
   )
}

type ProfileJobCTAProps = CustomJobCTAProps & {
   applicationInitiatedOnly?: boolean
}

const ProfileJobCTA = ({
   alreadyApplied,
   applicationSource,
   handleApplyClick,
   handleRemoveClick,
   job,
   applicationInitiatedOnly,
}: ProfileJobCTAProps) => {
   const { userData } = useAuth()
   const theme = useTheme()
   const isMobile = useIsMobile()
   const jobExpired = useIsJobExpired(job)

   const { handleConfirmApply, isApplying } = useCustomJobApply(
      job,
      applicationSource
   )

   const { job: jobApplication } = useUserJobApplication(userData.id, job.id)

   const JobExpiredDetails = () => {
      if (!jobExpired) return null

      if (alreadyApplied)
         return (
            <Stack direction={"row"} alignItems={"center"}>
               <XCircle
                  width={"18px"}
                  height={"18px"}
                  color={theme.brand.error[400]}
               />
               <Box sx={styles.noLongerAccepting} color={"error.400"}>
                  No longer accepting applications
               </Box>
            </Stack>
         )

      if (applicationInitiatedOnly)
         return <JobExpiredButton job={job} alreadyApplied={false} />
   }

   return (
      <Stack sx={[styles.ctaWrapper]}>
         <Stack
            direction={isMobile ? "column" : "row-reverse"}
            justifyContent={"center"}
            alignItems={"center"}
            width={isMobile ? "100%" : "auto"}
            spacing={isMobile ? 1.5 : 1.25}
         >
            <CustomJobApplyButton
               job={job as PublicCustomJob}
               applicationSource={applicationSource}
               handleApplyClick={handleApplyClick}
               isSecondary={false}
               alreadyApplied={alreadyApplied}
            />
            <ApplicationAlreadySentButton alreadyApplied={alreadyApplied} />
            {!jobApplication.removedFromUserProfile ? (
               <UserProfileJobOptionsButtons
                  applicationInitiatedOnly={applicationInitiatedOnly}
                  handleRemoveClick={handleRemoveClick}
                  handleApplyClick={handleConfirmApply}
                  isApplying={isApplying}
               />
            ) : null}
            {!jobExpired ? (
               <VisitApplicationPageButton
                  job={job}
                  alreadyApplied={alreadyApplied}
               />
            ) : null}
            <JobExpiredDetails />
         </Stack>
      </Stack>
   )
}

type UserProfileJobOptionsButtons = Pick<
   ProfileJobCTAProps,
   "applicationInitiatedOnly" | "handleRemoveClick" | "handleApplyClick"
> & {
   isApplying?: boolean
}

const UserProfileJobOptionsButtons = ({
   applicationInitiatedOnly,
   handleApplyClick,
   isApplying,
   handleRemoveClick,
}: UserProfileJobOptionsButtons) => {
   const isMobile = useIsMobile()

   if (!applicationInitiatedOnly) return null

   const haveAppliedText = "I've applied"
   return (
      <Stack spacing={isMobile ? 1 : 1.25} direction={"row"} width={"100%"}>
         <Button
            fullWidth
            variant="outlined"
            sx={[styles.removeJobBtn]}
            endIcon={<XCircle size={18} />}
            onClick={handleRemoveClick}
         >
            Remove job
         </Button>
         <Button
            fullWidth
            variant="outlined"
            sx={[styles.btn, styles.haveAppliedBtn]}
            onClick={handleApplyClick}
            color="primary"
            endIcon={
               isApplying ? (
                  <CircularProgress color="inherit" size={18} />
               ) : (
                  <CheckCircle size={18} />
               )
            }
         >
            {haveAppliedText}
         </Button>
      </Stack>
   )
}

const LiveStreamButton = () => {
   const { handleRegisterClick } = useRegistrationHandler()
   const { livestreamPresenter, serverUserEmail } = useLiveStreamDialog()

   return (
      <ActionButton
         livestreamPresenter={livestreamPresenter}
         onRegisterClick={handleRegisterClick}
         userEmailFromServer={serverUserEmail}
         isFixedToBottom
         canWatchRecording
      />
   )
}

type ApplicationAlreadySentButtonProps = {
   alreadyApplied: boolean
}
const ApplicationAlreadySentButton: FC<ApplicationAlreadySentButtonProps> = ({
   alreadyApplied,
}) => {
   if (!alreadyApplied) return null
   return (
      <Button
         fullWidth
         disabled
         variant="contained"
         sx={[styles.disabledBtn]}
         endIcon={<CheckCircle size={18} />}
      >
         Application sent
      </Button>
   )
}

type VisitApplicationPageButtonProps = {
   alreadyApplied: boolean
   job: PublicCustomJob
}
const VisitApplicationPageButton = ({
   alreadyApplied,
   job,
}: VisitApplicationPageButtonProps) => {
   const jobUrl = getJobUrl(job)

   return alreadyApplied ? (
      <Box width={"100%"}>
         <Button
            fullWidth
            sx={[styles.btn, styles.visitButton]}
            href={jobUrl}
            endIcon={<ExternalLink size={18} />}
            target="_blank"
         >
            Visit application page
         </Button>
      </Box>
   ) : null
}

type JobExpiredButtonProps = {
   alreadyApplied: boolean
   job: PublicCustomJob
}
const JobExpiredButton = ({ alreadyApplied, job }: JobExpiredButtonProps) => {
   const jobExpired = useIsJobExpired(job)
   if (alreadyApplied) return null
   return jobExpired ? (
      <Box width={"100%"}>
         <Button
            fullWidth
            disabled
            variant="contained"
            sx={[styles.btn, styles.disabledBtn]}
         >
            Job expired
         </Button>
      </Box>
   ) : null
}

const CustomJobApplyButton = ({
   applicationSource,
   job,
   handleApplyClick: handleClick,
   isSecondary,
   alreadyApplied,
}: CustomJobCTAProps) => {
   const jobUrl = getJobUrl(job)
   const jobExpired = useIsJobExpired(job)
   const { handleClickApplyBtn, isClickingOnApplyBtn } = useCustomJobApply(
      job,
      applicationSource
   )

   const handleApplyClick = useCallback(async () => {
      await handleClickApplyBtn()
      handleClick()
   }, [handleClickApplyBtn, handleClick])

   return !alreadyApplied && !jobExpired ? (
      <Button
         sx={styles.btn}
         component={"a"}
         href={jobUrl}
         target="_blank"
         rel="noopener noreferrer"
         variant={isSecondary ? "outlined" : "contained"}
         color={"primary"}
         fullWidth
         endIcon={
            isClickingOnApplyBtn ? (
               <CircularProgress size={20} color="inherit" />
            ) : (
               <ExternalLink size={18} />
            )
         }
         onClick={handleApplyClick}
      >
         {isClickingOnApplyBtn ? "Applying" : "Apply now"}
      </Button>
   ) : null
}

const getJobUrl = (job: PublicCustomJob) => {
   return addUtmTagsToLink({
      link: job.postingUrl,
      campaign: UTM_CAMPAIGN,
      content: job.title,
      medium: UTM_MEDIUM,
   })
}

export default CustomJobCTAButtons
