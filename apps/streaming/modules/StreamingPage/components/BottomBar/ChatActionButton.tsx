import React from "react"
import { MessageCircle } from "react-feather"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"
import { setActiveView, sidePanelSelector } from "store/streamingAppSlice"
import { useAppDispatch, useAppSelector } from "hooks"

export const ChatActionButton = React.forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   const { isOpen, activeView } = useAppSelector(sidePanelSelector)
   const dispatch = useAppDispatch()

   const chatActive = activeView === "chat" && isOpen

   const handleClick = () => {
      dispatch(setActiveView("chat"))
   }

   return (
      <ActionBarButtonStyled
         onClick={handleClick}
         active={chatActive}
         ref={ref}
         {...props}
      >
         <MessageCircle />
      </ActionBarButtonStyled>
   )
})
ChatActionButton.displayName = "ChatActionButton"
