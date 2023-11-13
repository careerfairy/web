import React from "react"
import { MessageCircle } from "react-feather"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"
import { setActiveView, sidePanelSelector } from "store/streamingAppSlice"
import { useAppDispatch, useAppSelector } from "hooks"
import { Badge } from "@mui/material"

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
      <Badge color="error" badgeContent={2}>
         <ActionBarButtonStyled
            onClick={handleClick}
            active={chatActive}
            ref={ref}
            {...props}
         >
            <MessageCircle />
         </ActionBarButtonStyled>
      </Badge>
   )
})
ChatActionButton.displayName = "ChatActionButton"
