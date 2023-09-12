import {
   SparkEventActionType,
   SparkEventClient,
   SparkSecondsWatched,
   SparkSecondsWatchedClient,
} from "@careerfairy/shared-lib/sparks/analytics"
import { useAuth } from "HOCs/AuthProvider"
import { sparkService } from "data/firebase/SparksService"
import { useRouter } from "next/router"
import {
   FC,
   createContext,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useRef,
} from "react"
import { useSelector } from "react-redux"
import {
   currentSparkIdSelector,
   sessionIdSelector,
} from "store/selectors/sparksFeedSelectors"
import useFingerPrint from "../../components/custom-hook/useFingerPrint"
import { OnProgressProps } from "react-player/base"

const BATCH_SIZE = 10 // Maximum number of events that can be batched
const BATCH_INTERVAL = 5000 // Interval for sending batched events (in ms)

type SparkEventTrackerProviderProps = {
   trackEvent: (event: SparkEventActionType) => void
   trackSecondsWatched: (event: OnProgressProps) => void
}

const SparkEventTrackerContext = createContext<SparkEventTrackerProviderProps>({
   trackEvent: () => {},
   trackSecondsWatched: () => {},
})

type Props = {
   /**
    * The original spark ID that the user clicked on to get to the Sparks feed
    */
   originalSparkId: string
}

export const SparksFeedTrackerProvider: FC<Props> = ({
   children,
   originalSparkId,
}) => {
   const router = useRouter()

   const { userData } = useAuth()

   const { data: visitorId } = useFingerPrint()

   const sessionId = useSelector(sessionIdSelector)
   const currentSparkId = useSelector(currentSparkIdSelector)

   const eventsBatch = useRef<SparkEventClient[]>([])

   const trackEvent = useCallback(
      (event: SparkEventActionType) => {
         if (!currentSparkId) return

         const referrer = document?.referrer || null

         const {
            utm_source = null,
            utm_medium = null,
            utm_campaign = null,
            utm_term = null,
            utm_content = null,
            referral = null,
         } = router.query

         const options: SparkEventClient = {
            visitorId,
            actionType: event,
            originalSparkId,
            utm_source: utm_source ? utm_source.toString() : null,
            utm_medium: utm_medium ? utm_medium.toString() : null,
            utm_campaign: utm_campaign ? utm_campaign.toString() : null,
            utm_term: utm_term ? utm_term.toString() : null,
            utm_content: utm_content ? utm_content.toString() : null,
            referralCode: referral ? referral.toString() : null,
            sparkId: currentSparkId,
            referrer,
            universityCountry: userData?.universityCountryCode || null,
            sessionId,
            stringTimestamp: new Date().toISOString(),
         }

         eventsBatch.current.push(options) //

         // If batch size limit is reached, send events
         if (eventsBatch.current.length >= BATCH_SIZE) {
            sendBatchedEvents()
         }
      },
      [
         currentSparkId,
         router.query,
         visitorId,
         originalSparkId,
         userData?.universityCountryCode,
         sessionId,
      ]
   )

   const trackSecondsWatched = useCallback(
      (event: OnProgressProps) => {
         const data: SparkSecondsWatchedClient = {
            sparkId: currentSparkId,
            sessionId,
            sparkLength: event.loadedSeconds,
            sparkPosition: event.playedSeconds,
            universityCountry: userData?.universityCountryCode || null,
            stringTimestamp: new Date().toISOString(),
            userId: userData?.id || null,
            visitorId,
         }
         // Add your implementation here
         sparkService.trackSparkSecondsWatched(data)
      },
      [
         currentSparkId,
         sessionId,
         userData?.id,
         userData?.universityCountryCode,
         visitorId,
      ] // Add dependencies if needed
   )

   const sendBatchedEvents = () => {
      // Send batched events to server
      sparkService.trackSparkEvents(eventsBatch.current).catch(console.error)
      eventsBatch.current = [] // Clear the batch
   }

   useEffect(() => {
      // Send batched events at regular intervals
      const intervalId = setInterval(() => {
         if (eventsBatch.current.length > 0) {
            sendBatchedEvents()
         }
      }, BATCH_INTERVAL)

      // Clean up interval on unmount
      return () => clearInterval(intervalId)
   }, [])

   useEffect(() => {
      // Define the function
      const handleBeforeUnload = () => {
         if (eventsBatch.current.length > 0) {
            localStorage.setItem(
               "unsentSparkEvents",
               JSON.stringify(eventsBatch.current)
            )
         }
      }

      window.addEventListener("beforeunload", handleBeforeUnload)

      // On load, check if there are any unsent events in localStorage
      const unsentSparkEvents = JSON.parse(
         localStorage.getItem("unsentSparkEvents")
      )
      if (unsentSparkEvents) {
         eventsBatch.current = unsentSparkEvents
         sendBatchedEvents() // Send unsent events
         localStorage.removeItem("unsentSparkEvents") // Clear unsent events from localStorage
      }

      return () =>
         window.removeEventListener("beforeunload", handleBeforeUnload)
   }, [])

   const value = useMemo(
      () => ({ trackEvent, trackSecondsWatched }),
      [trackEvent, trackSecondsWatched]
   )

   return (
      <SparkEventTrackerContext.Provider value={value}>
         {children}
      </SparkEventTrackerContext.Provider>
   )
}

export const useSparksFeedTracker = () => {
   const context = useContext(SparkEventTrackerContext)
   if (context === undefined) {
      throw new Error(
         "useSparksFeedEventTracker must be used within a SparkEventTrackerProvider"
      )
   }
   return context
}

export default SparksFeedTrackerProvider
