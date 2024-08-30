import {
   JobApplicationContext,
   JobApplicationSource,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, Button, CircularProgress, Stack } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useLiveStreamDialog } from "components/views/livestream-dialog"
import useRegistrationHandler from "components/views/livestream-dialog/useRegistrationHandler"
import { FC, useCallback } from "react"

import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"

import { useAuth } from "HOCs/AuthProvider"
import useCustomJobApply from "components/custom-hook/custom-job/useCustomJobApply"
import useIsJobExpired from "components/custom-hook/custom-job/useIsJobExpired"
import useUserJobApplication from "components/custom-hook/custom-job/useUserJobApplication"
import { useUserIsRegistered } from "components/custom-hook/live-stream/useUserIsRegistered"

import ActionButton from "components/views/livestream-dialog/views/livestream-details/action-button/ActionButton"
import ActionButtonProvider, {
   useActionButtonContext,
} from "components/views/livestream-dialog/views/livestream-details/action-button/ActionButtonProvider"
import WatchNowButton from "components/views/livestream-dialog/views/livestream-details/action-button/WatchNowButton"
import useRecordingAccess from "components/views/upcoming-livestream/HeroSection/useRecordingAccess"
import { CheckCircle, ExternalLink } from "react-feather"
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
})

type Props = {
   applicationContext?: JobApplicationContext
   job: PublicCustomJob
   handleApplyClick?: () => void
}

type CustomJobCTAProps = Props & {
   isSecondary?: boolean
   alreadyApplied?: boolean
}

const CustomJobCTAButtons = (props: Props) => {
   const { userData } = useAuth()
   const { alreadyApplied } = useUserJobApplication(userData?.id, props.job.id)

   const ctas: { [source in JobApplicationSource]: FC } = {
      livestream: () => (
         <LivestreamJobCTA {...props} alreadyApplied={alreadyApplied} />
      ),
      spark: () => {
         return <></>
      },
      profile: () => {
         return <></>
      },
      companyPage: () => {
         return <PortalJobCTA {...props} alreadyApplied={alreadyApplied} />
      },
      portal: () => <></>,
      notification: () => {
         return <></>
      },
   }

   return ctas[props.applicationContext.type](props)
}

type LivestreamCustomJobCTAProps = CustomJobCTAProps & {
   isUserRegistered?: boolean
}

const LivestreamJobCTA = (props: LivestreamCustomJobCTAProps) => {
   const { livestreamPresenter } = useLiveStreamDialog()
   const isUserRegisteredToEvent = useUserIsRegistered(livestreamPresenter.id)
   const isPast = (livestreamPresenter as LivestreamPresenter).isPast()

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

const PastLivestreamJobCTA = ({
   applicationContext,
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
               applicationContext={applicationContext}
               handleApplyClick={handleApplyClick}
               isSecondary={jobExpired || isUserRegistered}
               alreadyApplied={alreadyApplied}
            />

            {recordingAvailable.showRecording ? (
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
   applicationContext,
   job,
   handleApplyClick: handleClick,
   alreadyApplied,
   isUserRegistered,
}: LivestreamCustomJobCTAProps) => {
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
            {!isUserRegistered ? <LiveStreamButton /> : null}
            <CustomJobApplyButton
               job={job as PublicCustomJob}
               applicationContext={applicationContext}
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
   applicationContext,
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
               applicationContext={applicationContext}
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
   return alreadyApplied ? (
      <Box width={"100%"}>
         <Button
            fullWidth
            sx={[styles.btn, styles.visitButton]}
            href={job.postingUrl}
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
   applicationContext,
   job,
   handleApplyClick: handleClick,
   isSecondary,
   alreadyApplied,
}: CustomJobCTAProps) => {
   const jobExpired = useIsJobExpired(job)
   const { handleClickApplyBtn, isClickingOnApplyBtn } = useCustomJobApply(
      job,
      applicationContext
   )

   const handleApplyClick = useCallback(async () => {
      await handleClickApplyBtn()
      handleClick()
   }, [handleClickApplyBtn, handleClick])

   return !alreadyApplied && !jobExpired ? (
      <Button
         sx={styles.btn}
         component={"a"}
         href={job.postingUrl}
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

export default CustomJobCTAButtons
