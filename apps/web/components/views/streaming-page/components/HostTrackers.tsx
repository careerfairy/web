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
   const { livestreamId } = useStreamingContext()
   const { isOpen, activeView } = useSidePanel()
   const rtcClient = useRTCClient()

   useHandRaiseNotificationTracker(
      livestreamId,
      isOpen && activeView === ActiveViews.HAND_RAISE
   )

   useClientEvent(rtcClient, "exception", ({ code, msg, uid }) => {
      errorLogAndNotify(
         new Error(
            `Agora exception: Message: ${msg}, Code: ${code}, UID: ${uid}`
         )
      )
   })

   return null
}
