import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { useRouter } from "next/router"
import { useFirestoreDocument } from "../utils/useFirestoreDocument"

/**
 * This hook is crafted for the streaming application to retrieve livestream data from Firestore using the streamId from the router.
 * @returns {LivestreamEvent} The data for the livestream.
 *
 * CAUTION: This hook should be utilized with consideration due to the frequent updates of livestream data,
 * which can lead to substantial re-rendering and potential performance degradation.
 * For scenarios where only the livestreamId is required, the useStreamingContext is a more performance-optimized alternative.
 */
export const useLivestreamData = (): LivestreamEvent => {
   const {
      query: { streamId },
   } = useRouter()

   const { data } = useFirestoreDocument<LivestreamEvent>("livestreams", [
      streamId.toString(),
   ])

   return data
}
