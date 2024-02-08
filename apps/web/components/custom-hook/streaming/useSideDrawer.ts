import { useAppDispatch, useAppSelector } from "components/custom-hook/store"
import { useCallback } from "react"
import { toggleSidePanel } from "store/reducers/streamingAppReducer"
import { sidePanelSelector } from "store/selectors/streamingAppSelectors"

export const useSideDrawer = () => {
   const dispatch = useAppDispatch()
   const { isOpen, activeView } = useAppSelector(sidePanelSelector)

   const toggle = useCallback(() => dispatch(toggleSidePanel()), [dispatch])

   return { isOpen, toggle, activeView }
}
