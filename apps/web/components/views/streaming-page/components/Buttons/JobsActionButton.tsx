import { useActiveSidePanelView } from "components/custom-hook/streaming"
import useIsMobile from "components/custom-hook/useIsMobile"
import { forwardRef } from "react"
import { Briefcase } from "react-feather"
import { ActiveViews } from "store/reducers/streamingAppReducer"
import { useStreamingContext } from "../../context"
import { BrandedTooltip } from "../BrandedTooltip"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

export const JobsActionButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   const { handleSetActive, isActive } = useActiveSidePanelView(
      ActiveViews.JOBS
   )
   const { shouldStream } = useStreamingContext()
   const isMobile = useIsMobile()

   const isSpeedDial = shouldStream && isMobile

   return (
      <BrandedTooltip
         title={"Linked Jobs"}
         placement={isSpeedDial ? "left" : "top"}
      >
         <ActionBarButtonStyled
            onClick={handleSetActive}
            active={isActive}
            ref={ref}
            {...props}
         >
            <Briefcase />
         </ActionBarButtonStyled>
      </BrandedTooltip>
   )
})
JobsActionButton.displayName = "JobsActionButton"
