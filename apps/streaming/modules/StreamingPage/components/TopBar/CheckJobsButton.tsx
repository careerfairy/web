import { ResponsiveButton, useIsMobile } from "@careerfairy/shared-ui"
import { useAppDispatch } from "hooks"
import { Briefcase } from "react-feather"
import { setActiveView } from "store/streamingAppSlice"

export const CheckJobsButton = () => {
   const isMobile = useIsMobile("md")

   const dispatch = useAppDispatch()

   const handleClick = () => {
      dispatch(setActiveView("jobs"))
   }

   return (
      <ResponsiveButton
         onClick={handleClick}
         startIcon={<Briefcase />}
         variant="contained"
      >
         {isMobile ? "Jobs" : "Check our jobs"}
      </ResponsiveButton>
   )
}
