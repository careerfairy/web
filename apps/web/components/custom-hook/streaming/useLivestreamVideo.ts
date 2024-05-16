import { LivestreamVideo } from "@careerfairy/shared-lib/livestreams"
import { useFirestoreDocument } from "../utils/useFirestoreDocument"

/**
 * Custom hook to retrieve the video details for a specific livestream.
 * This hook utilizes the Firestore document path to fetch the video details
 * associated with a given livestream ID.
 *
 * @param {string} livestreamId - The unique identifier for the livestream.
 * @returns The video details including file name, streaming URL, and current status.
 */
export const useLivestreamVideo = (livestreamId: string) => {
   return useFirestoreDocument<LivestreamVideo>("livestreams", [
      livestreamId,
      "videos",
      "video",
   ])
}
