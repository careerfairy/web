import {
   ActiveView,
   setActiveView,
   sidePanelSelector,
} from "store/streamingAppSlice"
import { useAppDispatch, useAppSelector } from "hooks"

/**
 * Custom hook for setting and checking the active view.
 * @param {string} viewName - The name of the view.
 * @returns {Object} `isActive` (boolean) and `handleSetActive` (function).
 * @example
 * const { isActive, handleSetActive } = useActiveView("chat")
 *
 * <button onClick={handleSetActive} active={isActive}>Activate Chat View</button>
 */
export const useActiveSidePanelView = (viewName: ActiveView) => {
   const { isOpen, activeView } = useAppSelector(sidePanelSelector)
   const dispatch = useAppDispatch()

   const isActive = activeView === viewName && isOpen

   /**
    * `handleSetActive` is a function that sets the active view to the view specified by `viewName`.
    * It does this by dispatching the `setActiveView` action with `viewName` as the payload.
    */
   const handleSetActive = () => {
      dispatch(setActiveView(viewName))
   }

   return { isActive, handleSetActive }
}
