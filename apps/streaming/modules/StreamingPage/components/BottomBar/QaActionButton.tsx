import { QaIcon } from "components/icons"
import React from "react"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"
import { setActiveView, sidePanelSelector } from "store/streamingAppSlice"
import { useAppDispatch, useAppSelector } from "hooks"

export const QaActionButton = React.forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   const { isOpen, activeView } = useAppSelector(sidePanelSelector)
   const dispatch = useAppDispatch()

   const qAndAActive = activeView === "quests" && isOpen

   const handleClick = () => {
      dispatch(setActiveView("quests"))
   }

   return (
      <ActionBarButtonStyled
         onClick={handleClick}
         active={qAndAActive}
         ref={ref}
         {...props}
      >
         <QaIcon />
      </ActionBarButtonStyled>
   )
})
QaActionButton.displayName = "QaActionButton"
