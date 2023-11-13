import { HandRaiseIcon } from "components/icons"
import React from "react"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"

export const HandRaiseActionButton = React.forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   return (
      <ActionBarButtonStyled ref={ref} {...props}>
         <HandRaiseIcon />
      </ActionBarButtonStyled>
   )
})
HandRaiseActionButton.displayName = "HandRaiseActionButton"
