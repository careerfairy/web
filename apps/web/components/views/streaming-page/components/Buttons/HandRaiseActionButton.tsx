import { useActiveSidePanelView } from "components/custom-hook/streaming"
import useIsMobile from "components/custom-hook/useIsMobile"
import { HandRaiseIcon } from "components/views/common/icons"
import { useStreamingContext } from "components/views/streaming-page/context"
import { forwardRef } from "react"
import { ActiveViews } from "store/reducers/streamingAppReducer"
import { BrandedTooltip } from "../BrandedTooltip"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

export const HandRaiseActionButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   const { isHost } = useStreamingContext()

   const { handleSetActive, isActive } = useActiveSidePanelView(
      ActiveViews.HAND_RAISE
   )
   const { shouldStream } = useStreamingContext()
   const isMobile = useIsMobile()

   const isSpeedDial = shouldStream && isMobile

   const handleClick = () => {
      if (!isHost) return
      handleSetActive()
   }

   return (
      <BrandedTooltip
         title={"Hand raise"}
         placement={isSpeedDial ? "left" : "top"}
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
