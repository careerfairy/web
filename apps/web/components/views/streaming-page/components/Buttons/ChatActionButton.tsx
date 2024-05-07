import { useActiveSidePanelView } from "components/custom-hook/streaming/useActiveSidePanelView"
import { useNewChatCounter } from "components/custom-hook/streaming/useNewChatCounter"
import { BrandedBadge } from "components/views/common/inputs/BrandedBadge"
import { forwardRef } from "react"
import { MessageCircle } from "react-feather"
import { ActiveViews } from "store/reducers/streamingAppReducer"
import { useStreamingContext } from "../../context"
import { ActionTooltips } from "../BottomBar/AllActionComponents"
import { BrandedTooltip } from "../BrandedTooltip"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

export const ChatActionButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>(({ enableTooltip, ...props }, ref) => {
   const { handleSetActive, isActive } = useActiveSidePanelView(
      ActiveViews.CHAT
   )

   const { livestreamId } = useStreamingContext()
   const numberOfNewChats = useNewChatCounter(livestreamId, !isActive)

   return (
      <BrandedTooltip title={enableTooltip ? ActionTooltips.Chat : null}>
         <BrandedBadge color="error" badgeContent={numberOfNewChats}>
            <ActionBarButtonStyled
               onClick={handleSetActive}
               active={isActive}
               ref={ref}
               {...props}
            >
               <MessageCircle />
            </ActionBarButtonStyled>
         </BrandedBadge>
      </BrandedTooltip>
   )
})
ChatActionButton.displayName = "ChatActionButton"
