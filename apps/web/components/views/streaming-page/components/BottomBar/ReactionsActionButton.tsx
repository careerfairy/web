import { ReactionsIcon } from "components/views/common/icons"
import { forwardRef } from "react"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"

export const ReactionsActionButton = forwardRef<
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
