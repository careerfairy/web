import { HandRaiseIcon } from "components/icons"
import React from "react"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"
import { setActiveView, sidePanelSelector } from "store/streamingAppSlice"
import { useAppDispatch, useAppSelector } from "hooks"
import { useStreamContext } from "modules/StreamingPage/context"

export const HandRaiseActionButton = React.forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   const { isHost } = useStreamContext()
   const { isOpen, activeView } = useAppSelector(sidePanelSelector)

   const dispatch = useAppDispatch()

   const handRaiseActive = activeView === "hand-raise" && isOpen

   const handleClick = () => {
      if (!isHost) return
      dispatch(setActiveView("hand-raise"))
   }

   return (
      <ActionBarButtonStyled
         active={handRaiseActive}
         onClick={handleClick}
         ref={ref}
         {...props}
      >
         <HandRaiseIcon />
      </ActionBarButtonStyled>
   )
})
HandRaiseActionButton.displayName = "HandRaiseActionButton"
