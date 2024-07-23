import "intersection-observer" // polyfill for unsupported browsers
import { useInView } from "react-intersection-observer"

import {
   ImpressionLocation,
   LivestreamEvent,
   LivestreamImpression,
   pickPublicDataFromLivestream,
} from "@careerfairy/shared-lib/livestreams"
import { pickPublicDataFromUser } from "@careerfairy/shared-lib/users"
import { useRouter } from "next/router"
import { useMemo } from "react"
import { useAuth } from "../../HOCs/AuthProvider"
import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext"
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
   isRecommended,
   location = ImpressionLocation.unknown,
   disableTracking,
}: Props) => {
   const { pathname, asPath } = useRouter()
   const { userData } = useAuth()
   const firebase = useFirebaseService()

   const metaData = useMemo<Omit<LivestreamImpression, "createdAt" | "id">>(
      () => ({
         eventId: event?.id,
         eventTitle: event?.title,
         pathname,
         livestream: event ? pickPublicDataFromLivestream(event) : null,
         isRecommended: isRecommended ?? false,
         livestreamId: event?.id,
         user: userData ? pickPublicDataFromUser(userData) : null,
         userId: userData?.id ?? null,
         numberOfResults: numberOfResults || 0,
         positionInResults: positionInResults || 0,
         location,
         asPath,
      }),
      [
         asPath,
         event,
         isRecommended,
         location,
         numberOfResults,
         pathname,
         positionInResults,
         userData,
      ]
   )

   const { ref } = useInView({
      triggerOnce: true, // only ever trigger once per element
      threshold: 0.5, // At least 50% of the element must be visible
      delay: 1000, // Element must be at least visible for 1 second before triggering
      skip: disableTracking || !event,
      onChange: (inView) => {
         if (inView && event && !disableTracking) {
            // Fire a tracking event to your tracking service of choice.
            dataLayerLivestreamEvent("recommended_event_impression", event, {
               positionInResults,
               numberOfResults,
               pathname,
               location,
            })

            // Store the impression in the database.
            // This is a good place to use the `metaData` object.
            firebase.addImpression(event.id, metaData).catch(console.error)
         }
      },
   })

   return ref
}

export default useTrackLivestreamImpressions
