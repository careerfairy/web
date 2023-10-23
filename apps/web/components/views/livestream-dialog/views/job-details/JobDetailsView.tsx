import React, { FC, useCallback, useState } from "react"
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
import useRecordingAccess from "../../../upcoming-livestream/HeroSection/useRecordingAccess"
import { PublicCustomJob } from "@careerfairy/shared-lib/groups/customJobs"
import { Job } from "@careerfairy/shared-lib/ats/Job"
import useIsAtsJob from "../../../../custom-hook/useIsAtsJob"
import CustomJobCTAButton from "./main-content/CustomJobCTAButton"
import CustomJobApplyConfirmation from "./main-content/CustomJobApplyConfirmation"

type Props = {
   jobId: string
}

const JobDetailsView: FC = (props) => {
   const { query } = useRouter()
   const {
      livestreamPresenter,
      updatedStats,
      jobId: contextJobId,
      mode,
   } = useLiveStreamDialog()
   const { authenticatedUser } = useAuth()

   const { userHasBoughtRecording } = useRecordingAccess(
      authenticatedUser.email,
      livestreamPresenter,
      updatedStats
   )

   const { livestreamDialog } = query

   const [pathType, livestreamId, dialogPage, queryJobId] =
      livestreamDialog || []

   const jobId = mode === "page" ? queryJobId : contextJobId // If the mode is page, we need to use the query param jobId o

   if (!jobId) return <JobDetailsViewSkeleton />

   // If the livestream is in the past, we don't want to show or fetch the job details
   if (!livestreamPresenter.isPast()) {
      return (
         <NotFoundView
            title="Details in live stream"
            description="The job details will be made available after the livestream."
         />
      )
   }

   if (
      !livestreamPresenter.isUserRegistered(authenticatedUser.email) &&
      !userHasBoughtRecording
   ) {
      return (
         <NotFoundView
            title="Job details not available"
            description="You cannot see the job details, since you did not attend this live stream."
         />
      )
   }

   return (
      <SuspenseWithBoundary fallback={<JobDetailsViewSkeleton />}>
         <JobDetails jobId={jobId} {...props} />
      </SuspenseWithBoundary>
   )
}

const JobDetails: FC<Props> = ({ jobId }) => {
   const { livestream, livestreamPresenter, goToView } = useLiveStreamDialog()
   const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)
   let job: Job | PublicCustomJob

   job = useLivestreamJob(livestreamPresenter.getAssociatedJob(jobId))

   if (!job) {
      // If entered here, it means that the current job is no Ats Job or don't exist
      // In this situation, let's validate if it's a customJob
      job = livestream?.customJobs?.find((customJob) => customJob.id === jobId)
   }

   const isAtsJob = useIsAtsJob(job)

   const handleCloseConfirmationDialog = useCallback(() => {
      setShowConfirmationDialog(false)
   }, [])
   const handleShowConfirmationDialog = useCallback(() => {
      setShowConfirmationDialog(true)
   }, [])

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
            >
               <Box
                  sx={{
                     height: {
                        xs: 100,
                        md: 185,
                     },
                  }}
               />
            </HeroContent>
         }
         mainContent={
            <MainContent>
               <Stack spacing={2}>
                  <JobHeader
                     job={job}
                     livestreamPresenter={livestreamPresenter}
                  />

                  <JobDescription job={job} />

                  {showConfirmationDialog && !isAtsJob ? (
                     <CustomJobApplyConfirmation
                        handleClose={handleCloseConfirmationDialog}
                        job={job as PublicCustomJob}
                        livestreamId={livestream.id}
                     />
                  ) : null}
               </Stack>
            </MainContent>
         }
         fixedBottomContent={
            <Box component="span" ml="auto">
               {isAtsJob ? (
                  <JobCTAButton
                     livestreamPresenter={livestreamPresenter}
                     job={job as Job}
                  />
               ) : (
                  <CustomJobCTAButton
                     livestreamId={livestream.id}
                     job={job as PublicCustomJob}
                     handleClick={handleShowConfirmationDialog}
                  />
               )}
            </Box>
         }
      />
   )
}

export default JobDetailsView
