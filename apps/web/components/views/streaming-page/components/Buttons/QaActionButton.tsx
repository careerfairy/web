import { useActiveSidePanelView } from "components/custom-hook/streaming"
import { QaIcon } from "components/views/common/icons"
import { forwardRef } from "react"
import { ActiveViews } from "store/reducers/streamingAppReducer"
import { BrandedTooltip } from "../BrandedTooltip"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

export const QaActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
   (props, ref) => {
      const { handleSetActive, isActive } = useActiveSidePanelView(
         ActiveViews.QUESTIONS
      )

      return (
         <BrandedTooltip title="Questions and answers">
            <ActionBarButtonStyled
               onClick={handleSetActive}
               active={isActive}
               ref={ref}
               {...props}
            >
               <QaIcon />
            </ActionBarButtonStyled>
         </BrandedTooltip>
      )
   }
)
QaActionButton.displayName = "QaActionButton"
