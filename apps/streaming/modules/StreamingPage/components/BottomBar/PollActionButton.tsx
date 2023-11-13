import { PollIcon } from "components/icons"
import React from "react"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"

export const PollActionButton = React.forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   return (
      <ActionBarButtonStyled ref={ref} {...props}>
         <PollIcon />
      </ActionBarButtonStyled>
   )
})
PollActionButton.displayName = "PollActionButton"
