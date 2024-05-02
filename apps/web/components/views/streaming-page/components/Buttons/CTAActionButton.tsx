import { useActiveSidePanelView } from "components/custom-hook/streaming"
import useIsMobile from "components/custom-hook/useIsMobile"
import { forwardRef } from "react"
import { Link2 } from "react-feather"
import { ActiveViews } from "store/reducers/streamingAppReducer"
import { useStreamingContext } from "../../context"
import { BrandedTooltip } from "../BrandedTooltip"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

export const CTAActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
   (props, ref) => {
      const { handleSetActive, isActive } = useActiveSidePanelView(
         ActiveViews.CTA
      )
      const { shouldStream } = useStreamingContext()
      const isMobile = useIsMobile()

      const isSpeedDial = shouldStream && isMobile

      return (
         <BrandedTooltip
            title={"Send call to action"}
            placement={isSpeedDial ? "left" : "top"}
         >
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
