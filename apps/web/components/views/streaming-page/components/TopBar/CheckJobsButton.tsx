import { useAppDispatch } from "components/custom-hook/store"
import {
   useLivestreamData,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import { Briefcase } from "react-feather"
import { ActiveViews, setActiveView } from "store/reducers/streamingAppReducer"
import { ResponsiveStreamButton } from "../Buttons"
import { JoinTalentPoolButton } from "./JoinTalentPoolButton"

export const CheckJobsButton = () => {
   const isMobile = useStreamIsMobile("md")
   const livestream = useLivestreamData()

   const dispatch = useAppDispatch()

   const handleClick = () => {
      dispatch(setActiveView(ActiveViews.JOBS))
   }

   if (!livestream.hasJobs) {
      return <JoinTalentPoolButton livestream={livestream} />
   }

   return (
      <ResponsiveStreamButton
         onClick={handleClick}
         startIcon={<Briefcase />}
         variant="contained"
      >
         {isMobile ? "Jobs" : "Check our jobs"}
      </ResponsiveStreamButton>
   )
}
