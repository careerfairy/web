import { ReactionsIcon } from "components/views/common/icons"
import { forwardRef } from "react"
import { ActionTooltips } from "../BottomBar/AllActionComponents"
import { BrandedTooltip } from "../BrandedTooltip"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

export const ReactionsActionButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>(({ enableTooltip, ...props }, ref) => {
   return (
      <BrandedTooltip title={enableTooltip ? ActionTooltips.Reactions : null}>
         <ActionBarButtonStyled ref={ref} {...props}>
            <ReactionsIcon />
         </ActionBarButtonStyled>
      </BrandedTooltip>
   )
})
ReactionsActionButton.displayName = "ReactionsActionButton"
