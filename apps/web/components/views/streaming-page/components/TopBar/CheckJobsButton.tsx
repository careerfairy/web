import { ResponsiveStreamButton } from "../common"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { useAppDispatch } from "components/custom-hook/store"
import { Briefcase } from "react-feather"
import { ActiveViews, setActiveView } from "store/reducers/streamingAppReducer"

export const CheckJobsButton = () => {
   const isMobile = useStreamIsMobile("md")

   const dispatch = useAppDispatch()

   const handleClick = () => {
      dispatch(setActiveView(ActiveViews.JOBS))
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
