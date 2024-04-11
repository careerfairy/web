import { BrandedBadge } from "components/views/common/inputs/BrandedBadge"
import { useActiveSidePanelView } from "components/custom-hook/streaming/useActiveSidePanelView"
import { forwardRef } from "react"
import { MessageCircle } from "react-feather"
import { ActiveViews } from "store/reducers/streamingAppReducer"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"
import { useNewChatCounter } from "components/custom-hook/streaming/useNewChatCounter"
import { useStreamingContext } from "../../context"

export const ChatActionButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   const { handleSetActive, isActive } = useActiveSidePanelView(
      ActiveViews.CHAT
   )

   const { livestreamId } = useStreamingContext()
   const numberOfNewChats = useNewChatCounter(livestreamId, !isActive)

   return (
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
   )
})
ChatActionButton.displayName = "ChatActionButton"
