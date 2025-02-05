import { useClientEvent, useRTCClient } from "agora-rtc-react"
import { useHandRaiseNotificationTracker } from "components/custom-hook/streaming/hand-raise/useHandRaiseNotificationTracker"
import { ActiveViews } from "store/reducers/streamingAppReducer"
import { useSidePanel } from "store/selectors/streamingAppSelectors"
import { errorLogAndNotify } from "util/CommonUtil"
import { useStreamingContext } from "../context"

/**
 * Component responsible for tracking host-related behaviors within the streaming application.
 */
export const HostTrackers = () => {
   const { livestreamId, agoraUserId } = useStreamingContext()
   const { isOpen, activeView } = useSidePanel()

   const rtcClient = useRTCClient()

   useClientEvent(
      rtcClient,
      "connection-state-change",
      (currentState, prevState, reason) => {
         if (
            reason !== "LEAVE" &&
            (currentState === "DISCONNECTED" ||
               currentState === "DISCONNECTING")
         ) {
            errorLogAndNotify(
               new Error(
                  `RTC - Connection state changed to ${currentState} from ${prevState} with reason ${reason} for user ${agoraUserId} for livestream ${livestreamId}`
               )
            )
         }
      }
   )

   useHandRaiseNotificationTracker(
      livestreamId,
      isOpen && activeView === ActiveViews.HAND_RAISE
   )

   return null
}
