import {
   CategoryContainerTopAligned,
   QuestionContainerHeader,
   QuestionContainerTitle,
} from "materialUI/GlobalContainers"
import WorkIcon from "@mui/icons-material/Work"
import { memo } from "react"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"

type Props = {
   selectedState: string // current tab open, this one is "jobs"
   livestream: LivestreamEvent
   showMenu: boolean
}

const JobsCategory = ({ selectedState, livestream, showMenu }: Props) => {
   console.log("Rendering JobsCategory", livestream, showMenu)

   if (selectedState !== "jobs" || !showMenu) {
      console.log("avoid rendering all")
      return null
   }

   console.log("here")

   return (
      <CategoryContainerTopAligned className={undefined}>
         <QuestionContainerHeader className={undefined}>
            <QuestionContainerTitle>
               <WorkIcon fontSize="large" color="primary" /> Jobs
            </QuestionContainerTitle>
            <div>Available Jobs</div>
         </QuestionContainerHeader>
      </CategoryContainerTopAligned>
   )
}

export default memo(JobsCategory)
