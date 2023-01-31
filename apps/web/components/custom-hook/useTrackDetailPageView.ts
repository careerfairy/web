import { InViewHookResponse, useInView } from "react-intersection-observer"

// project imports
import useFingerPrint from "./useFingerPrint"
import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { recommendationServiceInstance } from "data/firebase/RecommendationService"

/**
 * Track livestream page views
 *   Updates the livestream stats doc
 *   Updates the livestream popularity field
 *
 * Fingerprints the user
 */
const useTrackDetailPageView = (
   stream: LivestreamEvent
): InViewHookResponse["ref"] => {
   const { data: visitorId } = useFingerPrint()
   const { trackDetailPageView } = useFirebaseService()

   const { ref } = useInView({
      triggerOnce: true, // only ever trigger once per element
      delay: 1000, // Element must be at least visible for 1 second before triggering
      skip: visitorId === undefined, // Will only start tracking view when visitorId is available/loaded
      onChange: (inView) => {
         if (inView && visitorId) {
            trackDetailPageView(stream.id, visitorId).then(console.error)

            // increase event popularity
            recommendationServiceInstance.visitDetailPage(stream, visitorId)
         }
      },
   })

   return ref
}

export default useTrackDetailPageView
