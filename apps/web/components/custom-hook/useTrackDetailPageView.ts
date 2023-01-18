import { InViewHookResponse, useInView } from "react-intersection-observer"

// project imports
import useFingerPrint from "./useFingerPrint"
import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext"

const useTrackDetailPageView = (eventId: string): InViewHookResponse["ref"] => {
   const { data: visitorId } = useFingerPrint()
   const { trackDetailPageView } = useFirebaseService()

   const { ref } = useInView({
      triggerOnce: true, // only ever trigger once per element
      delay: 1000, // Element must be at least visible for 1 second before triggering
      skip: visitorId === undefined,
      onChange: (inView) => {
         if (inView && visitorId) {
            return trackDetailPageView(eventId, visitorId)
         }
      },
   })

   return ref
}

export default useTrackDetailPageView
