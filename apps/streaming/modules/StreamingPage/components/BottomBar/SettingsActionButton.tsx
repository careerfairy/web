import React from "react"
import { Settings } from "react-feather"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"

export const SettingsActionButton = React.forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   return (
      <ActionBarButtonStyled ref={ref} {...props}>
         <Settings />
      </ActionBarButtonStyled>
   )
})
SettingsActionButton.displayName = "SettingsActionButton"
