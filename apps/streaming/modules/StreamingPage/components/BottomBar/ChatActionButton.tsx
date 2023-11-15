import { Badge } from "@mui/material"
import { useActiveSidePanelView } from "hooks"
import { forwardRef } from "react"
import { MessageCircle } from "react-feather"
import { ActiveViews } from "store/streamingAppSlice"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

export const ChatActionButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   const { handleSetActive, isActive } = useActiveSidePanelView(
      ActiveViews.CHAT
   )

   return (
      <Badge color="error" badgeContent={2}>
         <ActionBarButtonStyled
            onClick={handleSetActive}
            active={isActive}
            ref={ref}
            {...props}
         >
            <MessageCircle />
         </ActionBarButtonStyled>
      </Badge>
   )
})
ChatActionButton.displayName = "ChatActionButton"
