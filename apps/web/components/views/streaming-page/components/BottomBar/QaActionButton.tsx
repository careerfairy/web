import { QaIcon } from "components/views/common/icons"
import { useActiveSidePanelView } from "components/custom-hook/streaming"
import { forwardRef } from "react"
import { ActiveViews } from "store/reducers/streamingAppReducer"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

export const QaActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
   (props, ref) => {
      const { handleSetActive, isActive } = useActiveSidePanelView(
         ActiveViews.QUESTIONS
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
