import { QaIcon } from "components/icons"
import React from "react"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"

export const QaActionButton = React.forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   return (
      <ActionBarButtonStyled ref={ref} {...props}>
         <QaIcon />
      </ActionBarButtonStyled>
   )
})
QaActionButton.displayName = "QaActionButton"
