import {
   CategoryContainerTopAligned,
   QuestionContainerHeader,
   QuestionContainerTitle,
} from "materialUI/GlobalContainers"
import WorkIcon from "@mui/icons-material/Work"
import { memo } from "react"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import JobList from "./jobs/JobList"
import { SuspenseWithBoundary } from "../../../../ErrorBoundary"

type Props = {
   selectedState: string // current tab open, this one is "jobs"
   livestream: LivestreamEvent
   showMenu: boolean
}

const JobsCategory = ({ selectedState, livestream, showMenu }: Props) => {
   if (selectedState !== "jobs" || !showMenu || !livestream.jobs) {
      return null
   }

   return (
      <CategoryContainerTopAligned className={undefined}>
         <QuestionContainerHeader className={undefined}>
            <QuestionContainerTitle>
               <WorkIcon fontSize="large" color="primary" /> Jobs
            </QuestionContainerTitle>
         </QuestionContainerHeader>

         <SuspenseWithBoundary>
            <JobList livestream={livestream} />
         </SuspenseWithBoundary>
      </CategoryContainerTopAligned>
   )
}

export default memo(JobsCategory)
