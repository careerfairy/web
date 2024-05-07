import { useActiveSidePanelView } from "components/custom-hook/streaming"
import { forwardRef } from "react"
import { Briefcase } from "react-feather"
import { ActiveViews } from "store/reducers/streamingAppReducer"
import { ActionTooltips } from "../BottomBar/AllActionComponents"
import { BrandedTooltip } from "../BrandedTooltip"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

export const JobsActionButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>(({ enableTooltip, ...props }, ref) => {
   const { handleSetActive, isActive } = useActiveSidePanelView(
      ActiveViews.JOBS
   )

   return (
      <BrandedTooltip title={enableTooltip ? ActionTooltips.Jobs : null}>
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
