import { PollIcon } from "components/icons"
import React from "react"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"
import { setActiveView, sidePanelSelector } from "store/streamingAppSlice"
import { useAppDispatch, useAppSelector } from "hooks"

export const PollActionButton = React.forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   const { isOpen, activeView } = useAppSelector(sidePanelSelector)
   const dispatch = useAppDispatch()

   const pollActive = activeView === "polls" && isOpen

   const handleClick = () => {
      dispatch(setActiveView("polls"))
   }

   return (
      <ActionBarButtonStyled
         active={pollActive}
         onClick={handleClick}
         ref={ref}
         {...props}
      >
         <PollIcon />
      </ActionBarButtonStyled>
   )
})
PollActionButton.displayName = "PollActionButton"
