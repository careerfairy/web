import { FC } from "react"
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

type Props = {
   jobId: string
}

const JobDetailsView: FC = (props) => {
   const { query } = useRouter()
   const { livestreamPresenter, updatedStats } = useLiveStreamDialog()
   const { authenticatedUser } = useAuth()

   const { userHasBoughtRecording } = useRecordingAccess(
      authenticatedUser.email,
      livestreamPresenter,
      updatedStats
   )

   const { livestreamDialog } = query

   const [pathType, livestreamId, dialogPage, jobId] = livestreamDialog || []

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

   const job = useLivestreamJob(livestreamPresenter.getAssociatedJob(jobId))

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
               </Stack>
            </MainContent>
         }
         fixedBottomContent={
            <Box component="span" ml="auto">
               <JobCTAButton
                  livestreamPresenter={livestreamPresenter}
                  job={job}
               />
            </Box>
         }
      />
   )
}

export default JobDetailsView
