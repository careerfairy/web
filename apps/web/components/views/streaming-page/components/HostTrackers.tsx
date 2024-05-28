import { useHandRaiseNotificationTracker } from "components/custom-hook/streaming/hand-raise/useHandRaiseNotificationTracker"
import { ActiveViews } from "store/reducers/streamingAppReducer"
import { useSidePanel } from "store/selectors/streamingAppSelectors"
import { useStreamingContext } from "../context"

/**
 * Component responsible for tracking host-related behaviors within the streaming application.
 */
export const HostTrackers = () => {
   const { livestreamId } = useStreamingContext()
   const { isOpen, activeView } = useSidePanel()

   useHandRaiseNotificationTracker(
      livestreamId,
      isOpen && activeView === ActiveViews.HAND_RAISE
   )

   return null
}
