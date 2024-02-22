import React, { FC, useState } from "react"
import BaseDialogView, { HeroContent, MainContent } from "../../BaseDialogView"
import { useLiveStreamDialog } from "../../LivestreamDialog"
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions"
import Box from "@mui/material/Box"
import useLivestreamJob from "../../../../custom-hook/ats/useLivestreamJob"
import { useRouter } from "next/router"
import { SuspenseWithBoundary } from "../../../../ErrorBoundary"
import JobHeader from "./main-content/JobHeader"
import JobDetailsViewSkeleton from "./JobDetailsViewSkeleton"
import JobDescription from "./main-content/JobDescription"
import Stack from "@mui/material/Stack"
import JobCTAButton from "./main-content/JobCTAButton"
import NotFoundView from "../common/NotFoundView"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import {
   pickPublicDataFromCustomJob,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Job } from "@careerfairy/shared-lib/ats/Job"
import useIsAtsJob from "../../../../custom-hook/useIsAtsJob"
import CustomJobCTAButton from "./main-content/CustomJobCTAButton"
import CustomJobApplyConfirmation from "./main-content/CustomJobApplyConfirmation"
import useDialogStateHandler from "../../../../custom-hook/useDialogStateHandler"
import useCustomJob from "../../../../custom-hook/custom-job/useCustomJob"
import useRegistrationHandler from "../../useRegistrationHandler"
import ActionButton from "../livestream-details/action-button/ActionButton"
import { Grid, Typography } from "@mui/material"
import useRecordingAccess from "components/views/upcoming-livestream/HeroSection/useRecordingAccess"
import { sxStyles } from "types/commonTypes"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import DateUtil from "util/DateUtil"

const styles = sxStyles({
   root: {},
   btnGrid: {
      justifyContent: {xs: "center", sm: "flex-end"},
      gap: "10px",
      flexDirection: {xs: "column", sm: "row"},
      alignItems: "center",
   },
   btnGridPrimary: {
      order: { xs: 1, sm: 2 }
   },
   btnGridSecondary: {
      order: { xs: 2, sm: 1 }
   },
   livestreamCopy: {
      fontWeight: 700,
   },
   livestreamDateCopy: {
      fontWeight: 500
   },
   copyStackContainer: {
      gap: "12px"
   },
   copyContainer: {
      display: "flex",
      alignItems: "center",
   },
   heroContent: {
      padding: "10%"
   } 

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
   const { userData } = useAuth()

   const { livestream, livestreamPresenter, goToView } = useLiveStreamDialog()
   const [isOpen, handleOpen, handleClose] = useDialogStateHandler()
   const customJob = useCustomJob(jobId)
   const [isLiveStreamButtonDisabled, setIsLiveStreamButtonDisabled] = useState(false);

   let job: Job | PublicCustomJob

   job = useLivestreamJob(livestreamPresenter.getAssociatedJob(jobId))

   if (!job) {
      // If entered here, it means that the current job is no Ats Job or don't exist
      // In this situation, let's validate if it's a customJob
      job = pickPublicDataFromCustomJob(customJob)
   }

   const isAtsJob = useIsAtsJob(job)

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
               <Box sx={styles.copyContainer} >
                  <Stack sx={styles.copyStackContainer}>
                     <Typography
                        align="center"
                        variant={"h4"}
                        sx={styles.livestreamCopy}
                     >
                        {livestreamPresenter.isPast() ? 
                           "Ace your application: watch the stream recording and gain exclusive insights" :
                           "Ace your application: discover exclusive insights in the live stream"
                        }
                     </Typography>
                     <Typography
                        align="center"
                        variant={"body1"}
                        sx={styles.livestreamDateCopy}
                     >
                        {livestreamPresenter.isPast() ?
                           `Live streamed on: ${DateUtil.getJobApplicationDate(livestreamPresenter.start)}` :
                           `${DateUtil.formatLiveDate(livestreamPresenter.start)}`
                        }
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

                  {isOpen && !isAtsJob && userData?.id ? (
                     <CustomJobApplyConfirmation
                        handleClose={handleClose}
                        job={job as PublicCustomJob}
                        livestreamId={livestream.id}
                     />
                  ) : null}
               </Stack>
            </MainContent>
         }
         fixedBottomContent={
            <Grid container sx={styles.btnGrid} >
                  <Grid item sx={isLiveStreamButtonDisabled ? styles.btnGridSecondary : styles.btnGridPrimary}>
                     <LiveStreamButton
                        setIsDisabled={setIsLiveStreamButtonDisabled}
                     />
                  </Grid>
                  <Grid item sx={isLiveStreamButtonDisabled ? styles.btnGridPrimary : styles.btnGridSecondary}>
                     <JobButton
                        job={job as Job}
                        livestreamPresenter={livestreamPresenter}
                        isSecondary={!isLiveStreamButtonDisabled}
                        handleOpen={handleOpen}
                     />
                  </Grid>
            </Grid>
         }
      />
   )
}

type JobButtonProps = {
   job: Job
   livestreamPresenter: LivestreamPresenter
   isSecondary: boolean
   handleOpen: () => void
}

const JobButton: FC<JobButtonProps> = ({ job, livestreamPresenter, isSecondary, handleOpen }) => {
   const isAtsJob = useIsAtsJob(job)
   const { isLoggedOut } = useAuth()

   return (
      <>
         {isAtsJob ? 
             !isLoggedOut && (
               <JobCTAButton
                  livestreamPresenter={livestreamPresenter}
                  job={job as Job}
                  isSecondary={isSecondary}
               />
            ) : (
            <CustomJobCTAButton
               livestreamId={livestreamPresenter.id}
               job={job as PublicCustomJob}
               handleClick={handleOpen}
               isSecondary={isSecondary}
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
   const { livestreamPresenter , serverUserEmail, updatedStats } = useLiveStreamDialog()
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
