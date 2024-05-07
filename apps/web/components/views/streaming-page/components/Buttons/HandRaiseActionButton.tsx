import { useActiveSidePanelView } from "components/custom-hook/streaming"
import { HandRaiseIcon } from "components/views/common/icons"
import { useStreamingContext } from "components/views/streaming-page/context"
import { forwardRef } from "react"
import { ActiveViews } from "store/reducers/streamingAppReducer"
import { ActionTooltips } from "../BottomBar/AllActionComponents"
import { BrandedTooltip } from "../BrandedTooltip"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

export const HandRaiseActionButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>(({ enableTooltip, ...props }, ref) => {
   const { isHost } = useStreamingContext()

   const { handleSetActive, isActive } = useActiveSidePanelView(
      ActiveViews.HAND_RAISE
   )

   const handleClick = () => {
      if (!isHost) return
      handleSetActive()
   }

   return (
      <BrandedTooltip
         title={enableTooltip ? ActionTooltips["Hand raise"] : null}
      >
         <ActionBarButtonStyled
            active={isActive}
            onClick={handleClick}
            ref={ref}
            {...props}
         >
            <HandRaiseIcon />
         </ActionBarButtonStyled>
      </BrandedTooltip>
   )
})
HandRaiseActionButton.displayName = "HandRaiseActionButton"
