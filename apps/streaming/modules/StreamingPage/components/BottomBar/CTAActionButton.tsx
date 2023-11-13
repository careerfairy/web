import React from "react"
import { Link2 } from "react-feather"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"
import { useAppDispatch, useAppSelector } from "hooks"
import { setActiveView, sidePanelSelector } from "store/streamingAppSlice"

export const CTAActionButton = React.forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   const { isOpen, activeView } = useAppSelector(sidePanelSelector)
   const dispatch = useAppDispatch()

   const ctaActive = activeView === "cta" && isOpen

   const handleClick = () => {
      dispatch(setActiveView("cta"))
   }

   return (
      <ActionBarButtonStyled
         onClick={handleClick}
         active={ctaActive}
         ref={ref}
         {...props}
      >
         <Link2 />
      </ActionBarButtonStyled>
   )
})
CTAActionButton.displayName = "CTAActionButton"
