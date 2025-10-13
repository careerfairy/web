import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { LivestreamEvent } from "@careerfairy/shared-lib/src/livestreams"
import { useAuth } from "HOCs/AuthProvider"
import { livestreamService } from "data/firebase/LivestreamService"
import { AnalyticsEvents } from "util/analyticsConstants"
import { dataLayerLivestreamEvent } from "util/analyticsUtils"
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
 * For authenticated users, also tracks seen data in userLivestreamData
 */
const useTrackLivestreamView = (livestream: LivestreamEvent) => {
   const { trackDetailPageView } = useFirebaseService()
   const { userData, isLoadingUserData } = useAuth()

   const handleTrack = async ({
      id,
      visitorId,
      extraData: stream,
   }: TrackProps) => {
      if (stream) {
         const presenter = LivestreamPresenter.createFromDocument(stream)
         const eventName = presenter.isPast()
            ? AnalyticsEvents.RecordingDetailsPageViewed
            : AnalyticsEvents.EventDetailsPageViewed

         dataLayerLivestreamEvent(eventName, stream)

         // increase event popularity
         recommendationServiceInstance.visitDetailPage(
            stream as LivestreamEvent,
            visitorId
         )

         // Track seen data for authenticated users
         if (userData) {
            await livestreamService.setUserHasSeenLivestream(id, userData)
         }
      }
      return trackDetailPageView(id, visitorId)
   }

   const viewRef = useTrackPageView({
      trackDocumentId: livestream.id,
      extraData: livestream,
      handleTrack,
      skip: isLoadingUserData,
   })

   return viewRef
}

export default useTrackLivestreamView
