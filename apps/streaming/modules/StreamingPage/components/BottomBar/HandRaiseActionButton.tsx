import { HandRaiseIcon } from "components/icons"
import { useActiveSidePanelView } from "hooks"
import { useStreamContext } from "modules/StreamingPage/context"
import { forwardRef } from "react"
import { ActiveViews } from "store/streamingAppSlice"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

export const HandRaiseActionButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   const { isHost } = useStreamContext()

   const { handleSetActive, isActive } = useActiveSidePanelView(
      ActiveViews.HAND_RAISE
   )

   const handleClick = () => {
      if (!isHost) return
      handleSetActive()
   }

   return (
      <ActionBarButtonStyled
         active={isActive}
         onClick={handleClick}
         ref={ref}
         {...props}
      >
         <HandRaiseIcon />
      </ActionBarButtonStyled>
   )
})
HandRaiseActionButton.displayName = "HandRaiseActionButton"
