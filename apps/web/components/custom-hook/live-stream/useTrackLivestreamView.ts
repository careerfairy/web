import { LivestreamEvent } from "@careerfairy/shared-lib/src/livestreams"
import { useFirebaseService } from "../../../context/firebase/FirebaseServiceContext"
import { recommendationServiceInstance } from "../../../data/firebase/RecommendationService"
import useTrackPageView from "../useTrackDetailPageView"

type TrackProps = {
   id: string
   visitorId: string
   extraData: LivestreamEvent
}

/**
 * Track Livestream page view
 * Increases the Livestream page views and popularity
 */
const useTrackLivestreamView = (livestream: LivestreamEvent) => {
   const { trackDetailPageView } = useFirebaseService()

   const handleTrack = ({ id, visitorId, extraData: stream }: TrackProps) => {
      if (stream) {
         // increase event popularity
         recommendationServiceInstance.visitDetailPage(
            stream as LivestreamEvent,
            visitorId
         )
      }
      return trackDetailPageView(id, visitorId)
   }

   const viewRef = useTrackPageView({
      trackDocumentId: livestream.id,
      extraData: livestream,
      handleTrack,
   })

   return viewRef
}

export default useTrackLivestreamView
