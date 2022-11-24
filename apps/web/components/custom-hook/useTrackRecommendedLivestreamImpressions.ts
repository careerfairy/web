import { useInView } from "react-intersection-observer"
import { dataLayerLivestreamEvent } from "../../util/analyticsUtils"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { useRouter } from "next/router"
import { useMemo } from "react"
import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext"

type Args = {
   event: LivestreamEvent
   positionInResults: number
   numberOfResults: number
   isRecommended: boolean
}
const useTrackRecommendedLivestreamImpressions = ({
   isRecommended,
   event,
   numberOfResults,
   positionInResults,
}: Args) => {
   const { pathname } = useRouter()
   const firebase = useFirebaseService()
   const metaData = useMemo(
      () => ({
         eventId: event.id,
         eventTitle: event.title,
         positionInResults,
         numberOfResults,
         pathname,
      }),
      [event.id, event.title, numberOfResults, pathname, positionInResults]
   )

   const { ref } = useInView({
      triggerOnce: true,
      rootMargin: "-100px 0",
      onChange: (inView) => {
         if (inView && isRecommended) {
            // Fire a tracking event to your tracking service of choice.
            dataLayerLivestreamEvent("recommended_event_impression", event, {
               positionInResults,
               numberOfResults,
               pathname,
            })
            // Store the impression in the database.
            // This is a good place to use the `metaData` object.

            firebase.trackRecommendedLivestreamImpression(event.id, metaData)
         }
      },
   })

   return ref
}

export default useTrackRecommendedLivestreamImpressions
