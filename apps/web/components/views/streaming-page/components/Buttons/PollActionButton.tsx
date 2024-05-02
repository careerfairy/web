import { useActiveSidePanelView } from "components/custom-hook/streaming"
import useIsMobile from "components/custom-hook/useIsMobile"
import { PollIcon } from "components/views/common/icons"
import { forwardRef } from "react"
import { ActiveViews } from "store/reducers/streamingAppReducer"
import { useStreamingContext } from "../../context"
import { BrandedTooltip } from "../BrandedTooltip"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

export const PollActionButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   const { handleSetActive, isActive } = useActiveSidePanelView(
      ActiveViews.POLLS
   )
   const { shouldStream } = useStreamingContext()
   const isMobile = useIsMobile()

   const isSpeedDial = shouldStream && isMobile

   return (
      <BrandedTooltip title="Polls" placement={isSpeedDial ? "left" : "top"}>
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
