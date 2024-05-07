import { useActiveSidePanelView } from "components/custom-hook/streaming"
import { QaIcon } from "components/views/common/icons"
import { forwardRef } from "react"
import { ActiveViews } from "store/reducers/streamingAppReducer"
import { ActionTooltips } from "../BottomBar/AllActionComponents"
import { BrandedTooltip } from "../BrandedTooltip"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

export const QaActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
   ({ enableTooltip, ...props }, ref) => {
      const { handleSetActive, isActive } = useActiveSidePanelView(
         ActiveViews.QUESTIONS
      )

      return (
         <BrandedTooltip title={enableTooltip ? ActionTooltips["Q&A"] : null}>
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
