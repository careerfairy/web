import React from "react"
import { Link2 } from "react-feather"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"

export const CTAActionButton = React.forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   return (
      <ActionBarButtonStyled ref={ref} {...props}>
         <Link2 />
      </ActionBarButtonStyled>
   )
})
CTAActionButton.displayName = "CTAActionButton"
