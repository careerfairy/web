import { useAuth } from "HOCs/AuthProvider"
import { usePrefetchUserSparks } from "components/custom-hook/spark/useUserSparks"
import { useTrackUserParticipation } from "components/custom-hook/streaming/useTrackUserParticipation"
import { usePreFetchRecommendedEvents } from "components/custom-hook/useRecommendedEvents"
import { useStreamingContext } from "../context"

/**
 * Component responsible for tracking viewer-related behaviors within the streaming application.
 * - Sets the user as participating in the current livestream on mount.
 * - TODO:
 * - Refactor useCountLivestreamAttendanceMinutes to work here
 * - Refactor useRewardLivestreamAttendance to work here
 */
export const ViewerTrackers = () => {
   const { userData, userStats } = useAuth()
   const { livestreamId } = useStreamingContext()

   useTrackUserParticipation(livestreamId, userData, userStats)
   usePreFetchRecommendedEvents()
   usePrefetchUserSparks()

   return null
}
