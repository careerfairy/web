import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import WorkIcon from "@mui/icons-material/Work"
import Box from "@mui/material/Box"
import {
   CategoryContainerTopAligned,
   QuestionContainerHeader,
   QuestionContainerTitle,
} from "materialUI/GlobalContainers"
import { memo } from "react"
import { SuspenseWithBoundary } from "../../../../ErrorBoundary"
import JobList from "./jobs/JobList"

type Props = {
   selectedState: string // current tab open, this one is "jobs"
   livestream: LivestreamEvent
   showMenu: boolean
}

const JobsCategory = ({ selectedState, livestream, showMenu }: Props) => {
   if (selectedState !== "jobs" || !showMenu || !livestream.hasJobs) {
      return null
   }

   return (
      <CategoryContainerTopAligned className={undefined}>
         <QuestionContainerHeader className={undefined}>
            <QuestionContainerTitle>
               <WorkIcon fontSize="large" color="primary" /> Jobs
            </QuestionContainerTitle>
         </QuestionContainerHeader>

         <SuspenseWithBoundary fallback={<Box mt={1}>Fetching Jobs..</Box>}>
            <JobList livestream={livestream} />
         </SuspenseWithBoundary>
      </CategoryContainerTopAligned>
   )
}

export default memo(JobsCategory)
