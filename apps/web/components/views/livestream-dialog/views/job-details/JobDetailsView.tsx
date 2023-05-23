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
import EmptyJobDetailsView from "./EmptyJobDetailsView"

type Props = {
   jobId: string
}

const JobDetailsView: FC = (props) => {
   const { query } = useRouter()

   const { livestreamDialog } = query

   const [pathType, livestreamId, dialogPage, jobId] = livestreamDialog || []

   if (!jobId) return <JobDetailsViewSkeleton />

   return (
      <SuspenseWithBoundary fallback={<JobDetailsViewSkeleton />}>
         <JobDetails jobId={jobId} {...props} />
      </SuspenseWithBoundary>
   )
}

const JobDetails: FC<Props> = ({ jobId }) => {
   const { livestream, livestreamPresenter, goToView, handleBack } =
      useLiveStreamDialog()

   const job = useLivestreamJob(livestreamPresenter.getAssociatedJob(jobId))

   if (!job) {
      return <EmptyJobDetailsView />
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
            >
               <Box height={185} />
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
