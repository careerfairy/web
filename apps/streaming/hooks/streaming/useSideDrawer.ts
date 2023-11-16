import { useAppDispatch, useAppSelector } from "hooks"
import { useCallback } from "react"
import { sidePanelSelector, toggleSidePanel } from "store/streamingAppSlice"

export const useSideDrawer = () => {
   const dispatch = useAppDispatch()
   const { isOpen, activeView } = useAppSelector(sidePanelSelector)

   const toggle = useCallback(() => dispatch(toggleSidePanel()), [dispatch])

   return { isOpen, toggle, activeView }
}
