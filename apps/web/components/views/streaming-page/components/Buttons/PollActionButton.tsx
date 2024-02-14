import { PollIcon } from "components/views/common/icons"
import { useActiveSidePanelView } from "components/custom-hook/streaming"
import { forwardRef } from "react"
import { ActiveViews } from "store/reducers/streamingAppReducer"
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
