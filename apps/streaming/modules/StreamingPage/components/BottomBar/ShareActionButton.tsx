import React from "react"
import { Airplay } from "react-feather"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"

export const ShareActionButton = React.forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   return (
      <ActionBarButtonStyled ref={ref} {...props}>
         <Airplay />
      </ActionBarButtonStyled>
   )
})
ShareActionButton.displayName = "ShareActionButton"
