import { BrandedBadge } from "components/views/common/inputs/BrandedBadge"
import { useActiveSidePanelView } from "components/custom-hook/streaming/useActiveSidePanelView"
import { forwardRef } from "react"
import { MessageCircle } from "react-feather"
import { ActiveViews } from "store/reducers/streamingAppReducer"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

export const ChatActionButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   const { handleSetActive, isActive } = useActiveSidePanelView(
      ActiveViews.CHAT
   )

   return (
      <BrandedBadge color="error" badgeContent={2}>
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
