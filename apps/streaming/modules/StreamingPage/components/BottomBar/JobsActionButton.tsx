import { useActiveSidePanelView } from "hooks"
import { forwardRef } from "react"
import { Briefcase } from "react-feather"
import { ActiveViews } from "store/streamingAppSlice"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

export const JobsActionButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   const { handleSetActive, isActive } = useActiveSidePanelView(
      ActiveViews.JOBS
   )

   return (
      <ActionBarButtonStyled
         onClick={handleSetActive}
         active={isActive}
         ref={ref}
         {...props}
      >
         <Briefcase />
      </ActionBarButtonStyled>
   )
})
JobsActionButton.displayName = "JobsActionButton"
