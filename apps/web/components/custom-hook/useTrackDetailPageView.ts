import { InViewHookResponse, useInView } from "react-intersection-observer"

// project imports
import useFingerPrint from "./useFingerPrint"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { recommendationServiceInstance } from "data/firebase/RecommendationService"

type Props = {
   trackDocumentId: string
   handleTrack: (id: string, visitorId: string) => Promise<void>
   stream?: LivestreamEvent
}
/**
 * Track page views
 *   Updates the ${trackDocumentId} stats doc
 *   Updates the livestream popularity field if does receive a stream
 *
 * Fingerprints the user
 */
const useTrackPageView = ({
   trackDocumentId,
   handleTrack,
   stream,
}: Props): InViewHookResponse["ref"] => {
   const { data: visitorId } = useFingerPrint()

   const { ref } = useInView({
      triggerOnce: true, // only ever trigger once per element
      delay: 1000, // Element must be at least visible for 1 second before triggering
      skip: visitorId === undefined, // Will only start tracking view when visitorId is available/loaded
      onChange: (inView) => {
         if (inView && visitorId) {
            handleTrack(trackDocumentId, visitorId).catch(console.error)

            if (stream) {
               // increase event popularity
               recommendationServiceInstance.visitDetailPage(
                  stream as LivestreamEvent,
                  visitorId
               )
            }
         }
      },
   })

   return ref
}

export default useTrackPageView
