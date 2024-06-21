import { useAppDispatch } from "components/custom-hook/store"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { Briefcase } from "react-feather"
import { ActiveViews, setActiveView } from "store/reducers/streamingAppReducer"
import { useStreamHasJobs } from "store/selectors/streamingAppSelectors"
import { ResponsiveStreamButton } from "../Buttons"
import { JoinTalentPoolButton } from "./JoinTalentPoolButton"

export const CheckJobsButton = () => {
   const isMobile = useStreamIsMobile("md")
   const livestreamHasJobs = useStreamHasJobs()

   const dispatch = useAppDispatch()

   const handleClick = () => {
      dispatch(setActiveView(ActiveViews.JOBS))
   }

   if (!livestreamHasJobs) {
      return <JoinTalentPoolButton />
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
