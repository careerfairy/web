import { Job } from "@careerfairy/shared-lib/ats/Job"
import {
   PublicCustomJob,
   pickPublicDataFromCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { ButtonProps, Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import useRecordingAccess from "components/views/upcoming-livestream/HeroSection/useRecordingAccess"
import { useRouter } from "next/router"
import { FC, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { AutomaticActions } from "store/reducers/sparksFeedReducer"
import { autoAction } from "store/selectors/sparksFeedSelectors"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { SuspenseWithBoundary } from "../../../../ErrorBoundary"
import useLivestreamJob from "../../../../custom-hook/ats/useLivestreamJob"
import useCustomJob from "../../../../custom-hook/custom-job/useCustomJob"
import useDialogStateHandler from "../../../../custom-hook/useDialogStateHandler"
import useIsAtsJob from "../../../../custom-hook/useIsAtsJob"
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions"
import BaseDialogView, { HeroContent, MainContent } from "../../BaseDialogView"
import { useLiveStreamDialog } from "../../LivestreamDialog"
import useRegistrationHandler from "../../useRegistrationHandler"
import NotFoundView from "../common/NotFoundView"
import ActionButton from "../livestream-details/action-button/ActionButton"
import JobDetailsViewSkeleton from "./JobDetailsViewSkeleton"
import CustomJobApplyConfirmation from "./main-content/CustomJobApplyConfirmation"
import CustomJobCTAButton from "./main-content/CustomJobCTAButton"
import JobCTAButton from "./main-content/JobCTAButton"
import JobDescription from "./main-content/JobDescription"
import JobHeader from "./main-content/JobHeader"

const styles = sxStyles({
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
   livestreamCopy: {
      fontWeight: 700,
   },
   livestreamDateCopy: {
      fontWeight: 500,
   },
   copyStackContainer: {
      gap: "12px",
   },
   copyContainer: {
      display: "flex",
      alignItems: "center",
   },
   heroContent: {
      padding: "10%",
   },
   jobApplyConfirmationDialog: {
      bottom: "100px",
   },
})

type Props = {
   jobId: string
}

const JobDetailsView: FC = (props) => {
   const { query } = useRouter()
   const { jobId: contextJobId, mode } = useLiveStreamDialog()

   const { livestreamDialog } = query

   const [pathType, livestreamId, dialogPage, queryJobId] =
      livestreamDialog || []

   const jobId = mode === "page" ? queryJobId : contextJobId // If the mode is page, we need to use the query param jobId o

   if (!jobId) return <JobDetailsViewSkeleton />

   return (
      <SuspenseWithBoundary fallback={<JobDetailsViewSkeleton />}>
         <JobDetails jobId={jobId} {...props} />
      </SuspenseWithBoundary>
   )
}

const JobDetails: FC<Props> = ({ jobId }) => {
   const { livestream, livestreamPresenter, goToView } = useLiveStreamDialog()
   const [isOpen, handleOpen, handleClose] = useDialogStateHandler()
   const customJob = useCustomJob(jobId)
   const [isLiveStreamButtonDisabled, setIsLiveStreamButtonDisabled] =
      useState(false)
   const autoActionType = useSelector(autoAction)
   const isAutoApply = autoActionType === AutomaticActions.APPLY

   let job: Job | PublicCustomJob

   job = useLivestreamJob(livestreamPresenter.getAssociatedJob(jobId))

   if (!job) {
      // If entered here, it means that the current job is no Ats Job or don't exist
      // In this situation, let's validate if it's a customJob
      job = pickPublicDataFromCustomJob(customJob)
   }

   const isAtsJob = useIsAtsJob(job)

   useEffect(() => {
      if (job && isAutoApply) {
         handleOpen()
      }
   }, [isAutoApply, handleOpen, job])

   if (!job) {
      return (
         <NotFoundView
            title="Job not found"
            description="The job you are looking for does not exist. It may have been deleted or closed or the link you followed may be broken."
         />
      )
   }

   return (
      <BaseDialogView
         heroContent={
            <HeroContent
               backgroundImg={getResizedUrl(
                  livestream.backgroundImageUrl,
                  "lg"
               )}
               onBackPosition={"top-left"}
               onBackClick={() => goToView("livestream-details")}
               noMinHeight
               sx={styles.heroContent}
            >
               <Box sx={styles.copyContainer}>
                  <Stack sx={styles.copyStackContainer}>
                     <Typography
                        align="center"
                        variant={"h4"}
                        sx={styles.livestreamCopy}
                     >
                        {livestreamPresenter.isPast()
                           ? "Ace your application: watch the stream recording and gain exclusive insights"
                           : "Ace your application: discover exclusive insights in the live stream"}
                     </Typography>
                     <Typography
                        align="center"
                        variant={"body1"}
                        sx={styles.livestreamDateCopy}
                     >
                        {livestreamPresenter.isPast()
                           ? `Live streamed on: ${DateUtil.getJobApplicationDate(
                                livestreamPresenter.start
                             )}`
                           : `${DateUtil.formatLiveDate(
                                livestreamPresenter.start
                             )}`}
                     </Typography>
                  </Stack>
               </Box>
            </HeroContent>
         }
         mainContent={
            <MainContent>
               <Stack spacing={3}>
                  <JobHeader
                     job={job}
                     livestreamPresenter={livestreamPresenter}
                  />

                  <JobDescription job={job} />

                  {isOpen && !isAtsJob ? (
                     <CustomJobApplyConfirmation
                        handleClose={handleClose}
                        job={job as PublicCustomJob}
                        livestreamId={livestream.id}
                        autoApply={isAutoApply}
                        sx={styles.jobApplyConfirmationDialog}
                     />
                  ) : null}
               </Stack>
            </MainContent>
         }
         fixedBottomContent={
            <Stack
               sx={[
                  styles.btnWrapper,
                  isLiveStreamButtonDisabled
                     ? styles.btnSecondary
                     : styles.btnPrimary,
               ]}
            >
               <LiveStreamButton
                  setIsDisabled={setIsLiveStreamButtonDisabled}
               />

               <Stack direction="row" spacing="10px">
                  <JobButton
                     job={job as Job}
                     livestreamId={livestream.id}
                     isSecondary={!isLiveStreamButtonDisabled}
                     handleOpen={handleOpen}
                  />
               </Stack>
            </Stack>
         }
      />
   )
}

type JobButtonProps = {
   job: Job
   livestreamId: string
   isSecondary?: boolean
   handleOpen: () => void
} & ButtonProps

export const JobButton: FC<JobButtonProps> = ({
   job,
   livestreamId,
   isSecondary = false,
   handleOpen,
   ...props
}) => {
   const isAtsJob = useIsAtsJob(job)
   const { isLoggedOut } = useAuth()

   return (
      <>
         {isAtsJob ? (
            !isLoggedOut && (
               <JobCTAButton
                  livestreamId={livestreamId}
                  job={job as Job}
                  isSecondary={isSecondary}
                  {...props}
               />
            )
         ) : (
            <CustomJobCTAButton
               livestreamId={livestreamId}
               job={job as PublicCustomJob}
               handleClick={handleOpen}
               isSecondary={isSecondary}
               {...props}
            />
         )}
      </>
   )
}

type LiveStreamButtonProps = {
   setIsDisabled: (value: boolean) => void
}

const LiveStreamButton: FC<LiveStreamButtonProps> = ({ setIsDisabled }) => {
   const { authenticatedUser } = useAuth()
   const { handleRegisterClick } = useRegistrationHandler()
   const { livestreamPresenter, serverUserEmail, updatedStats } =
      useLiveStreamDialog()
   const { showRecording } = useRecordingAccess(
      authenticatedUser.email || serverUserEmail,
      livestreamPresenter,
      updatedStats
   )

   return (
      <ActionButton
         livestreamPresenter={livestreamPresenter}
         onRegisterClick={handleRegisterClick}
         userEmailFromServer={serverUserEmail}
         isFixedToBottom
         canWatchRecording={showRecording}
         setIsDisabled={setIsDisabled}
      />
   )
}

export default JobDetailsView
