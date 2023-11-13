import React from "react"
import { Briefcase } from "react-feather"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"
import { useAppDispatch, useAppSelector } from "hooks"
import { setActiveView, sidePanelSelector } from "store/streamingAppSlice"

export const JobsActionButton = React.forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   const { isOpen, activeView } = useAppSelector(sidePanelSelector)

   const dispatch = useAppDispatch()

   const jobsActive = activeView === "jobs" && isOpen

   const handleClick = () => {
      dispatch(setActiveView("jobs"))
   }

   return (
      <ActionBarButtonStyled
         onClick={handleClick}
         active={jobsActive}
         ref={ref}
         {...props}
      >
         <Briefcase />
      </ActionBarButtonStyled>
   )
})
JobsActionButton.displayName = "JobsActionButton"
