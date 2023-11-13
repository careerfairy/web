import React from "react"
import { Briefcase } from "react-feather"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"

export const JobsActionButton = React.forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   return (
      <ActionBarButtonStyled ref={ref} {...props}>
         <Briefcase />
      </ActionBarButtonStyled>
   )
})
JobsActionButton.displayName = "JobsActionButton"
