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
      skip: visitorId === undefined, // Will only start tracking view when visitorId is available/loaded
      onChange: (inView) => {
         if (inView && visitorId) {
            trackDetailPageView(eventId, visitorId).then(console.error)
         }
      },
   })

   return ref
}

export default useTrackDetailPageView
