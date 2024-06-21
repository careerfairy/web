import { LivestreamPresentation } from "@careerfairy/shared-lib/livestreams"
import { useFirestoreDocument } from "../utils/useFirestoreDocument"

/**
 * Custom hook to retrieve the PDF presentation details for a specific live stream.
 * This hook utilizes the Firestore document path to fetch the presentation details
 * associated with a given live stream ID.
 *
 * @param {string} livestreamId - The unique identifier for the live stream.
 * @returns The PDF presentation details including file name, download URL, and current page.
 */
export const useLivestreamPDFPresentation = (livestreamId: string) => {
   return useFirestoreDocument<LivestreamPresentation>("livestreams", [
      livestreamId,
      "presentations",
      "presentation",
   ])
}
