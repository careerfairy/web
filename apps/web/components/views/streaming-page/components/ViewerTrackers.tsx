import { useAuth } from "HOCs/AuthProvider"
import { usePrefetchUserSparks } from "components/custom-hook/spark/useUserSparks"
import { useLivestreamData } from "components/custom-hook/streaming/useLivestreamData"
import { useTrackUserParticipation } from "components/custom-hook/streaming/useTrackUserParticipation"
import useCountLivestreamAttendanceMinutes from "components/custom-hook/useCountLivestreamAttendanceMinutes"
import { usePreFetchRecommendedEvents } from "components/custom-hook/useRecommendedEvents"
import useRewardLivestreamAttendance from "components/custom-hook/useRewardLivestreamAttendance"
import { useRtcConnectionState } from "store/selectors/streamingAppSelectors"

/**
 * Component responsible for tracking viewer-related behaviors within the streaming application.
 * - Sets the user as participating in the current livestream on mount.
 * - TODO:
 * - Refactor useCountLivestreamAttendanceMinutes to work here
 * - Refactor useRewardLivestreamAttendance to work here
 */
export const ViewerTrackers = () => {
   const { userData, userStats } = useAuth()
   const livestream = useLivestreamData()
   const rtcConnectionState = useRtcConnectionState()

   const { currentState, reason } = rtcConnectionState || {}

   useTrackUserParticipation(livestream, userData, userStats)
   usePreFetchRecommendedEvents()
   usePrefetchUserSparks()
   useCountLivestreamAttendanceMinutes(livestream, currentState, reason)
   useRewardLivestreamAttendance(livestream)

   return null
}
