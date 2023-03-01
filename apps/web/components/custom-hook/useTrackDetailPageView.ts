import { InViewHookResponse, useInView } from "react-intersection-observer"

// project imports
import useFingerPrint from "./useFingerPrint"

type Props = {
   trackDocumentId: string
   handleTrack: (props) => Promise<void>
   extraData?: any
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
   extraData,
}: Props): InViewHookResponse["ref"] => {
   const { data: visitorId } = useFingerPrint()

   const { ref } = useInView({
      triggerOnce: true, // only ever trigger once per element
      delay: 1000, // Element must be at least visible for 1 second before triggering
      skip: visitorId === undefined, // Will only start tracking view when visitorId is available/loaded
      onChange: (inView) => {
         if (inView && visitorId) {
            handleTrack({ id: trackDocumentId, visitorId, extraData }).catch(
               console.error
            )
         }
      },
   })

   return ref
}

export default useTrackPageView
