import "intersection-observer" // polyfill for unsupported browsers
import { useInView } from "react-intersection-observer"

import {
   ImpressionLocation,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import { useRouter } from "next/router"
import { AnalyticsEvents } from "util/analyticsConstants"
import { dataLayerLivestreamEvent } from "../../util/analyticsUtils"

type Props = {
   positionInResults?: number
   numberOfResults?: number
   isRecommended?: boolean
   event?: LivestreamEvent
   location: ImpressionLocation | string
   disableTracking?: boolean
}
const useTrackLivestreamImpressions = ({
   event,
   numberOfResults,
   positionInResults,
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   isRecommended,
   location = ImpressionLocation.unknown,
   disableTracking,
}: Props) => {
   const { pathname } = useRouter()

   const { ref } = useInView({
      triggerOnce: true, // only ever trigger once per element
      threshold: 0.5, // At least 50% of the element must be visible
      delay: 1000, // Element must be at least visible for 1 second before triggering
      skip: disableTracking || !event,
      onChange: (inView) => {
         if (inView && event && !disableTracking) {
            // Fire a tracking event to your tracking service of choice.
            dataLayerLivestreamEvent(
               AnalyticsEvents.RecommendedEventImpression,
               event,
               {
                  positionInResults,
                  numberOfResults,
                  pathname,
                  location,
               }
            )

            // Store the impression in the database.
            // This is a good place to use the `metaData` object.
            // firebase.addImpression(event.id, metaData).catch(console.error)
         }
      },
   })

   return ref
}

export default useTrackLivestreamImpressions
