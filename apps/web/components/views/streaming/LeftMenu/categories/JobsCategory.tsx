import {
   CategoryContainerTopAligned,
   QuestionContainerHeader,
   QuestionContainerTitle,
} from "materialUI/GlobalContainers"
import WorkIcon from "@mui/icons-material/Work"
import { memo } from "react"
import { useCurrentStream } from "../../../../../context/stream/StreamContext"

const JobsCategory = () => {
   const { currentLivestream } = useCurrentStream()
   console.log("Rendering JobsCategory", currentLivestream)

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
