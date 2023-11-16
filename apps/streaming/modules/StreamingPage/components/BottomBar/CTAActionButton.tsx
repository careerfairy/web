import { useActiveSidePanelView } from "hooks"
import { forwardRef } from "react"
import { Link2 } from "react-feather"
import { ActiveViews } from "store/streamingAppSlice"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

export const CTAActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
   (props, ref) => {
      const { handleSetActive, isActive } = useActiveSidePanelView(
         ActiveViews.CTA
      )

      return (
         <ActionBarButtonStyled
            onClick={handleSetActive}
            active={isActive}
            ref={ref}
            {...props}
         >
            <Link2 />
         </ActionBarButtonStyled>
      )
   }
)
CTAActionButton.displayName = "CTAActionButton"
