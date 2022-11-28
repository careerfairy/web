import { useCallback } from "react"
import { useAuth } from "../../HOCs/AuthProvider"
import {
   LivestreamEvent,
   LivestreamEventPublicData,
   pickPublicDataFromLivestream,
} from "@careerfairy/shared-lib/dist/livestreams"
import usePersistentInterval from "./usePersistentInterval"
import { pickPublicDataFromUser } from "@careerfairy/shared-lib/dist/users"
import { useRouter } from "next/router"
import { useSelector } from "react-redux"
import { rtcConnectionStateSelector } from "../../store/selectors/streamSelectors"
import { livestreamRepo } from "../../data/RepositoryInstances"
import { LivestreamPresenter } from "@careerfairy/shared-lib/dist/livestreams/LivestreamPresenter"

// Send a heartbeat event to the server every minute
const HEARTBEAT_INTERVAL_SECONDS = 60

/**
 * Record how many minutes the user attended the livestream
 * Periodically sends a heartbeat event to the server
 * participatingStats subCollection
 *
 * Only records the attendance if the user is logged in and the event is live
 * @param livestreamData
 */
const useCountLivestreamAttendanceMinutes = (
   livestreamData: LivestreamEvent
) => {
   const { userData, isLoggedIn } = useAuth()
   const {
      query: { livestreamId },
   } = useRouter()

   const agoraRtcConnectionStatus = useSelector(rtcConnectionStateSelector)
   const { curState, reason } = agoraRtcConnectionStatus

   const intervalCallback = useCallback(() => {
      // Don't record the minutes if the user is not logged in
      if (!isLoggedIn) {
         return
      }

      try {
         // This session should be a duplicated tab, we don't want to count the minutes twice
         if (curState === "DISCONNECTED" && reason === "UID_BANNED") {
            // another approach could be to proceed if the curState === "CONNECTED" or !== "DISCONNECTED"
            // but might be useful to track the attendance time for such scenarios so that we can check their
            // frequency with a histogram view
            return
         }

         const livestreamPresenter =
            LivestreamPresenter.createFromDocument(livestreamData)

         // do nothing, stream is not live or is a test event
         if (!livestreamPresenter.isLive() || livestreamPresenter.isTest()) {
            return
         }

         // livestream data to be saved
         let livestream: LivestreamEventPublicData
         if ("parentLivestream" in livestreamData) {
            livestream = livestreamData.parentLivestream
         } else {
            livestream = pickPublicDataFromLivestream(
               livestreamData as LivestreamEvent
            )
         }

         // only send a heartbeat for the right livestream document
         // old breakout room documents have a different livestream id
         if (livestream.id === livestreamId) {
            livestreamRepo
               .heartbeat(
                  livestream,
                  pickPublicDataFromUser(userData),
                  livestreamPresenter.elapsedMinutesSinceStart()
               )
               .catch(console.error)
         }
      } catch (e) {
         console.error(e)
      }
   }, [
      livestreamData?.hasStarted,
      livestreamData?.hasEnded,
      userData?.id,
      isLoggedIn,
      livestreamId,
      curState,
      reason,
   ])

   // runs the intervalCallback periodically
   usePersistentInterval(
      HEARTBEAT_INTERVAL_SECONDS,
      "livestreamLastHeartbeatTimestamp",
      intervalCallback
   )
}

export default useCountLivestreamAttendanceMinutes
