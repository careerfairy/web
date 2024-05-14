import { useAppDispatch } from "components/custom-hook/store"
import { useCallback } from "react"
import { toggleSidePanel } from "store/reducers/streamingAppReducer"
import { useSidePanel } from "store/selectors/streamingAppSelectors"

export const useSideDrawer = () => {
   const dispatch = useAppDispatch()
   const { isOpen, activeView } = useSidePanel()

   const toggle = useCallback(() => dispatch(toggleSidePanel()), [dispatch])

   return { isOpen, toggle, activeView }
}
