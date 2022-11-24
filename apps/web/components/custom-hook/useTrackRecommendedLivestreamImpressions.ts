import { useInView } from "react-intersection-observer"
import { dataLayerLivestreamEvent } from "../../util/analyticsUtils"
import {
   LivestreamEvent,
   LivestreamImpression,
   pickPublicDataFromLivestream,
} from "@careerfairy/shared-lib/dist/livestreams"
import { useRouter } from "next/router"
import { useMemo } from "react"
import { pickPublicDataFromUser } from "@careerfairy/shared-lib/dist/users"
import { useAuth } from "../../HOCs/AuthProvider"
import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext"

type Props = {
   positionInResults?: number
   numberOfResults?: number
   isRecommended?: boolean
   event?: LivestreamEvent
}
const useTrackRecommendedLivestreamImpressions = ({
   event,
   numberOfResults,
   positionInResults,
   isRecommended,
}: Props) => {
   const { pathname } = useRouter()
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
      }),
      [
         event,
         isRecommended,
         numberOfResults,
         pathname,
         positionInResults,
         userData,
      ]
   )

   const { ref } = useInView({
      triggerOnce: true,
      rootMargin: "-100px",
      onChange: (inView) => {
         if (inView && isRecommended && event) {
            // Fire a tracking event to your tracking service of choice.
            console.log("DataLayer Sent")
            dataLayerLivestreamEvent("recommended_event_impression", event, {
               positionInResults,
               numberOfResults,
               pathname,
            })

            // Store the impression in the database.
            // This is a good place to use the `metaData` object.
            firebase.addImpression(event.id, metaData).catch(console.error)
         }
      },
   })

   return ref
}

export default useTrackRecommendedLivestreamImpressions
