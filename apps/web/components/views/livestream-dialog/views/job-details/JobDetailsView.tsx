import {
   CustomJob,
   CustomJobApplicationSource,
   CustomJobApplicationSourceTypes,
   PublicCustomJob,
   pickPublicDataFromCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { ButtonProps, Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import { CustomJobDetailsProvider } from "components/views/common/jobs/CustomJobDetailsProvider"
import CustomJobCTAButtons from "components/views/jobs/components/custom-jobs/CustomJobCTAButtons"
import CustomJobDetailsView from "components/views/jobs/components/custom-jobs/CustomJobDetailsView"
import { useRouter } from "next/router"
import { FC, useCallback, useEffect } from "react"
import { useSelector } from "react-redux"
import { AutomaticActions } from "store/reducers/sparksFeedReducer"
import { autoAction } from "store/selectors/sparksFeedSelectors"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { SuspenseWithBoundary } from "../../../../ErrorBoundary"
import useCustomJob from "../../../../custom-hook/custom-job/useCustomJob"
import useDialogStateHandler from "../../../../custom-hook/useDialogStateHandler"

import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions"
import { HeroContent } from "../../BaseDialogView"
import { useLiveStreamDialog } from "../../LivestreamDialog"
import NotFoundView from "../common/NotFoundView"
import JobDetailsViewSkeleton from "./JobDetailsViewSkeleton"

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

   const [, , , queryJobId] = livestreamDialog || []

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
   const [, handleOpen] = useDialogStateHandler()
   const customJob = useCustomJob(jobId)
   const applicationSource: CustomJobApplicationSource = {
      id: livestreamPresenter.id,
      source: CustomJobApplicationSourceTypes.Livestream,
   }

   const autoActionType = useSelector(autoAction)

   const onApply = useCallback(() => {
      if (userData?.id) {
         goToView("livestream-details")
      }
   }, [userData, goToView])

   const isAutoApply = autoActionType === AutomaticActions.APPLY

   const job = pickPublicDataFromCustomJob(customJob)

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

   const livestreamDetailCustomJobHeroContent = (
      <HeroContent
         backgroundImg={getResizedUrl(livestream.backgroundImageUrl, "lg")}
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
                     : `${DateUtil.formatLiveDate(livestreamPresenter.start)}`}
               </Typography>
            </Stack>
         </Box>
      </HeroContent>
   )

   return (
      <CustomJobDetailsProvider
         customJob={job as CustomJob}
         source={applicationSource}
      >
         <CustomJobDetailsView
            job={job as CustomJob}
            sx={{ p: "16px !important" }}
            heroSx={{ p: "16px !important" }}
            heroContent={livestreamDetailCustomJobHeroContent}
            companyName={livestreamPresenter.company}
            companyLogoUrl={livestreamPresenter.companyLogoUrl}
            context={applicationSource}
            onApply={onApply}
         />
      </CustomJobDetailsProvider>
   )
}

type JobButtonProps = {
   job: PublicCustomJob
   livestreamId: string
   isSecondary?: boolean
   handleOpen: () => void
} & ButtonProps

export const JobButton: FC<JobButtonProps> = ({
   job,
   livestreamId,
   handleOpen,
}) => {
   return (
      <CustomJobCTAButtons
         applicationSource={{
            id: livestreamId,
            source: CustomJobApplicationSourceTypes.Livestream,
         }}
         job={job}
         handleApplyClick={handleOpen}
      />
   )
}

export default JobDetailsView
