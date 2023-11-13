import React from "react"
import { MessageCircle } from "react-feather"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"

export const ChatActionButton = React.forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   return (
      <ActionBarButtonStyled ref={ref} {...props}>
         <MessageCircle />
      </ActionBarButtonStyled>
   )
})
ChatActionButton.displayName = "ChatActionButton"
