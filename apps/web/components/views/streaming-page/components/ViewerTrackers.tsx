import { useAuth } from "HOCs/AuthProvider"
import { useSetUserIsParticipating } from "components/custom-hook/streaming/useSetUserIsParticipating"
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

   useSetUserIsParticipating(livestreamId, userData, userStats)

   return null
}
