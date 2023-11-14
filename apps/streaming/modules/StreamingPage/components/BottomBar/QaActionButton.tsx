import { QaIcon } from "components/icons"
import { useActiveSidePanelView } from "hooks"
import { forwardRef } from "react"
import { ActiveViews } from "store/streamingAppSlice"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

export const QaActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
   (props, ref) => {
      const { handleSetActive, isActive } = useActiveSidePanelView(
         ActiveViews.QUESTS
      )

      return (
         <ActionBarButtonStyled
            onClick={handleSetActive}
            active={isActive}
            ref={ref}
            {...props}
         >
            <QaIcon />
         </ActionBarButtonStyled>
      )
   }
)
QaActionButton.displayName = "QaActionButton"
