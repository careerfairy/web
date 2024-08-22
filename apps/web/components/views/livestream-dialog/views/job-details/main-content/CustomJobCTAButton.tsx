import {
   JobApplicationSource,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, Button, CircularProgress, Stack } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useLiveStreamDialog } from "components/views/livestream-dialog"
import useRegistrationHandler from "components/views/livestream-dialog/useRegistrationHandler"
import { FC, useCallback, useState } from "react"
import CustomJobEntryApply from "../../../../streaming/LeftMenu/categories/jobs/CustomJobEntryApply"

import { sxStyles } from "@careerfairy/shared-ui"
import { useAuth } from "HOCs/AuthProvider"
import useCustomJobApply from "components/custom-hook/custom-job/useCustomJobApply"
import useIsJobExpired from "components/custom-hook/custom-job/useIsJobExpired"
import useUserJobApplication from "components/custom-hook/custom-job/useUserJobApplication"
import { useUserIsRegistered } from "components/custom-hook/live-stream/useUserIsRegistered"
import { ExternalLink } from "react-feather"
import ActionButton from "../../livestream-details/action-button/ActionButton"
import WatchNowButton from "../../livestream-details/action-button/WatchNowButton"

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
   applicationSentBtn: {
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
   jobExpiredButton: {},
})

type Props = {
   livestreamId: string
   job: PublicCustomJob
   handleClick?: () => void // TODO-WG: Check this handle click
   isSecondary?: boolean
   from?: JobApplicationSource
}

type CustomJobCTAProps = Props & {
   alreadyApplied?: boolean
}

const CustomJobCTAButton = (props: Props) => {
   const isUserRegisteredToEvent = useUserIsRegistered(props.livestreamId)
   const { userData } = useAuth()
   const { alreadyApplied } = useUserJobApplication(userData?.id, props.job.id)

   const ctas: { [source in JobApplicationSource]: FC } = {
      pastLivestream: () => (
         <PastLivestreamJobCTA {...props} alreadyApplied={alreadyApplied} />
      ),
      upcomingLivestream: () => (
         <UpcomingLivestreamJobCTA
            {...props}
            alreadyApplied={alreadyApplied}
            isUserRegistered={isUserRegisteredToEvent}
         />
      ),
      spark: () => {
         return <></>
      },
      profile: () => {
         return <></>
      },
      companyPage: () => {
         return <></>
      },
      portal: () => {
         return <></>
      },
      notification: () => {
         return <></>
      },
   }

   return ctas[props.from](props)
}

type LivestreamCustomJobCTAProps = CustomJobCTAProps & {
   isUserRegistered?: boolean
}

const PastLivestreamJobCTA = ({
   livestreamId,
   job,
   handleClick,
   alreadyApplied,
}: LivestreamCustomJobCTAProps) => {
   const isMobile = useIsMobile()
   // TODO-WG: Remove after implementation
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const [isLiveStreamButtonDisabled, setIsLiveStreamButtonDisabled] =
      useState(false)

   return (
      <Stack
         sx={[
            styles.btnWrapper,
            isLiveStreamButtonDisabled
               ? styles.btnSecondary
               : styles.btnPrimary,
         ]}
         direction={isMobile ? "column" : "row"}
         spacing={1}
      >
         {/* Better to have all buttons here */}
         <CustomJobEntryApply
            job={job as PublicCustomJob}
            livestreamId={livestreamId}
            handleApplyClick={handleClick}
            isSecondary={!isLiveStreamButtonDisabled}
         />
         <WatchNowButton />
         <VisitApplicationPageButton
            job={job}
            alreadyApplied={alreadyApplied}
         />
      </Stack>
   )
}

const UpcomingLivestreamJobCTA = ({
   livestreamId,
   job,
   handleClick,
   alreadyApplied,
   isUserRegistered,
}: LivestreamCustomJobCTAProps) => {
   const isMobile = useIsMobile()
   const [isLiveStreamButtonDisabled, setIsLiveStreamButtonDisabled] =
      useState(false)

   return (
      <Stack sx={[styles.ctaWrapper]}>
         <Stack
            direction={isMobile ? "column" : "row-reverse"}
            justifyContent={"center"}
            alignItems={"center"}
            width={"100%"}
            spacing={2}
         >
            {!isUserRegistered ? (
               <LiveStreamButton
                  setIsDisabled={setIsLiveStreamButtonDisabled}
               />
            ) : null}
            <CustomJobApplyButton
               job={job as PublicCustomJob}
               livestreamId={livestreamId}
               handleClick={handleClick}
               isSecondary={!isLiveStreamButtonDisabled}
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

type LiveStreamButtonProps = {
   setIsDisabled: (value: boolean) => void
}

const LiveStreamButton: FC<LiveStreamButtonProps> = ({ setIsDisabled }) => {
   const { handleRegisterClick } = useRegistrationHandler()
   const { livestreamPresenter, serverUserEmail } = useLiveStreamDialog()

   return (
      <ActionButton
         livestreamPresenter={livestreamPresenter}
         onRegisterClick={handleRegisterClick}
         userEmailFromServer={serverUserEmail}
         isFixedToBottom
         canWatchRecording
         setIsDisabled={setIsDisabled}
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
         sx={[styles.applicationSentBtn]}
      >
         Application sent!
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
            sx={[styles.btn, styles.jobExpiredButton]}
            href={job.postingUrl}
            endIcon={<ExternalLink size={18} />}
            target="_blank"
         >
            Job expired
         </Button>
      </Box>
   ) : null
}

const CustomJobApplyButton = ({
   job,
   livestreamId,
   handleClick,
   isSecondary,
   alreadyApplied,
}: CustomJobCTAProps) => {
   const jobExpired = useIsJobExpired(job)
   const { handleClickApplyBtn, isClickingOnApplyBtn } = useCustomJobApply(
      job,
      livestreamId
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

export default CustomJobCTAButton
