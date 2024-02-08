import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { useRouter } from "next/router"
import { useFirestoreDocument } from "../utils/useFirestoreDocument"

/**
 * This hook retrieves livestream data from Firestore using the streamId from the router.
 * @returns {LivestreamEvent} The data for the livestream.
 *
 * CAUTION: This hook should be used sparingly due to the frequent updates of livestream data when the event is live,
 * which can lead to substantial re-rendering and potential performance degradation.
 *
 * If you only need the livestreamId, consider using the `useStreamingContext` hook as a more performance-optimized alternative.
 *
 * If you need the livestream data, use this hook at the smallest possible component to minimize the DOM node re-rendering,
 * or ensure that all the children of the component are memoized and not re-rendering.
 *
 * @example
 * // Good usage
 * const LivestreamTitle = () => {
 *   const livestreamData = useLivestreamData();
 *   return <h1>{livestreamData.title}</h1>;
 * }
 *
 * // Bad usage
 * const LivestreamPage = () => {
 *   const livestreamData = useLivestreamData();
 *   // The entire page re-renders whenever livestreamData updates
 *   return (
 *     <div>
 *       <h1>{livestreamData.title}</h1>
 *       <p>{livestreamData.description}</p>
 *       // ... more components ...
 *     </div>
 *   );
 * }
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
