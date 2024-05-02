import { ReactionsIcon } from "components/views/common/icons"
import { forwardRef } from "react"
import { BrandedTooltip } from "../BrandedTooltip"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

export const ReactionsActionButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   return (
      <BrandedTooltip title="Reactions">
         <ActionBarButtonStyled ref={ref} {...props}>
            <ReactionsIcon />
         </ActionBarButtonStyled>
      </BrandedTooltip>
   )
})
ReactionsActionButton.displayName = "ReactionsActionButton"
