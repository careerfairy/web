import { useActiveSidePanelView } from "components/custom-hook/streaming"
import { PollIcon } from "components/views/common/icons"
import { forwardRef } from "react"
import { ActiveViews } from "store/reducers/streamingAppReducer"
import { ActionTooltips } from "../BottomBar/AllActionComponents"
import { BrandedTooltip } from "../BrandedTooltip"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

export const PollActionButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>(({ enableTooltip, ...props }, ref) => {
   const { handleSetActive, isActive } = useActiveSidePanelView(
      ActiveViews.POLLS
   )

   return (
      <BrandedTooltip title={enableTooltip ? ActionTooltips.Polls : null}>
         <ActionBarButtonStyled
            active={isActive}
            onClick={handleSetActive}
            ref={ref}
            {...props}
         >
            <PollIcon />
         </ActionBarButtonStyled>
      </BrandedTooltip>
   )
})
PollActionButton.displayName = "PollActionButton"
