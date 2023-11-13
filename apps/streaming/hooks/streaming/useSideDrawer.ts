import { useAppDispatch, useAppSelector } from "hooks"
import { useCallback } from "react"
import { sideDrawerSelector, toggleSidePanel } from "store/streamingAppSlice"

export const useSideDrawer = () => {
   const dispatch = useAppDispatch()
   const { isOpen, activeView } = useAppSelector(sideDrawerSelector)

   const toggle = useCallback(() => dispatch(toggleSidePanel()), [dispatch])

   return { isOpen, toggle, activeView }
}
