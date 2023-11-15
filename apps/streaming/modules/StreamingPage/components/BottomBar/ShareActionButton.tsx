import { forwardRef } from "react"
import { Airplay } from "react-feather"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"

export const ShareActionButton = forwardRef<
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
