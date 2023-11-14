import { PollIcon } from "components/icons"
import { useActiveSidePanelView } from "hooks"
import { forwardRef } from "react"
import { ActiveViews } from "store/streamingAppSlice"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

export const PollActionButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   const { handleSetActive, isActive } = useActiveSidePanelView(
      ActiveViews.POLLS
   )

   return (
      <ActionBarButtonStyled
         active={isActive}
         onClick={handleSetActive}
         ref={ref}
         {...props}
      >
         <PollIcon />
      </ActionBarButtonStyled>
   )
})
PollActionButton.displayName = "PollActionButton"
