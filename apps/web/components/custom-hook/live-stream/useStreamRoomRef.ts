import { livestreamService } from "data/firebase/LivestreamService"
import { useRouter } from "next/router"

/**
 * Retrieves a Firestore document reference for a livestream or breakout room. Utilizes `useRouter` to obtain `livestreamId` and `breakoutRoomId` from query parameters. Returns null if `livestreamId` is absent, otherwise returns a document reference with a `LivestreamEvent` converter.
 *
 * @return Firestore document reference to a livestream or breakout room, or null if `livestreamId` is missing.
 */
export const useStreamingRef = () => {
   const { query } = useRouter()

   const livestreamId = query.livestreamId?.toString()
   const breakoutRoomId = query.breakoutRoomId?.toString()

   if (!livestreamId) return null

   return livestreamService.getLivestreamRef(livestreamId, breakoutRoomId)
}
