import { ReactionsIcon } from "components/icons"
import React from "react"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"

export const ReactionsActionButton = React.forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   return (
      <ActionBarButtonStyled ref={ref} {...props}>
         <ReactionsIcon />
      </ActionBarButtonStyled>
   )
})
ReactionsActionButton.displayName = "ReactionsActionButton"
