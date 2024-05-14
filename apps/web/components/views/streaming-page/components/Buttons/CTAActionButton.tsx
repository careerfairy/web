import { useActiveSidePanelView } from "components/custom-hook/streaming"
import { forwardRef } from "react"
import { Link2 } from "react-feather"
import { ActiveViews } from "store/reducers/streamingAppReducer"
import { ActionTooltips } from "../BottomBar/AllActionComponents"
import { BrandedTooltip } from "../BrandedTooltip"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

export const CTAActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
   ({ enableTooltip, ...props }, ref) => {
      const { handleSetActive, isActive } = useActiveSidePanelView(
         ActiveViews.CTA
      )

      return (
         <BrandedTooltip title={enableTooltip ? ActionTooltips.CTA : null}>
            <ActionBarButtonStyled
               onClick={handleSetActive}
               active={isActive}
               ref={ref}
               {...props}
            >
               <Link2 />
            </ActionBarButtonStyled>
         </BrandedTooltip>
      )
   }
)
CTAActionButton.displayName = "CTAActionButton"
