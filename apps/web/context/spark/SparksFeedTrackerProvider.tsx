import {
   SparkEventActionType,
   SparkEventClient,
   SparkSecondWatchedClient,
} from "@careerfairy/shared-lib/sparks/analytics"
import { useAuth } from "HOCs/AuthProvider"
import useBatchedEvents from "components/custom-hook/utils/useBatchedEvents"
import { sparkService } from "data/firebase/SparksService"
import { useRouter } from "next/router"
import { FC, createContext, useCallback, useContext, useMemo } from "react"
import { useSelector } from "react-redux"
import {
   currentSparkIdSelector,
   originalSparkIdSelector,
} from "store/selectors/sparksFeedSelectors"
import { v4 as uuidv4 } from "uuid"
import useFingerPrint from "../../components/custom-hook/useFingerPrint"

const BATCH_SIZE = 10 // Maximum number of events that can be batched
const BATCH_INTERVAL = 5000 // Interval for sending batched events (in ms)

type SparkEventTrackerProviderProps = {
   trackEvent: (event: SparkEventActionType) => void
   trackSecondsWatched: (secondsWatched: number) => void
}

const SparkEventTrackerContext = createContext<SparkEventTrackerProviderProps>({
   trackEvent: () => {},
   trackSecondsWatched: () => {},
})

/**
 * SparksFeedTrackerProvider is a React context provider that handles the tracking of Spark events.
 * It lives at the root of the application and is responsible for sending batch events.
 * This provider ensures that events are tracked and sent no matter where you are in the application,
 * even if you leave the feed. Because it is at the root of the application, the events are always sent.
 *
 * @example
 * ```jsx
 * <SparksFeedTrackerProvider>
 *   <App />
 * </SparksFeedTrackerProvider>
 * ```
 *
 * @component
 * @category Providers
 */
export const SparksFeedTrackerProvider: FC = ({ children }) => {
   const router = useRouter()

   const { userData } = useAuth()

   const { data: visitorId } = useFingerPrint()

   const currentSparkId = useSelector(currentSparkIdSelector)
   const originalSparkId = useSelector(originalSparkIdSelector)

   const addEventToBatch = useBatchedEvents<SparkEventClient>(
      (data) => sparkService.trackSparkEvents(data),
      BATCH_SIZE,
      BATCH_INTERVAL,
      "unsentSparkEvents"
   )

   const addSecondsWatchedToBatch = useBatchedEvents<SparkSecondWatchedClient>(
      (data) => sparkService.trackSparkSecondsWatched(data),
      BATCH_SIZE,
      BATCH_INTERVAL,
      "unsentSparkSecondsWatched"
   )
   const sessionId = useMemo(() => {
      if (!currentSparkId) return null
      return generatSessionId(currentSparkId)
   }, [currentSparkId])

   const trackEvent = useCallback(
      (event: SparkEventActionType) => {
         if (!currentSparkId || !visitorId) return

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

         addEventToBatch(options)
      },
      [
         currentSparkId,
         router.query,
         visitorId,
         originalSparkId,
         userData?.universityCountryCode,
         sessionId,
         addEventToBatch,
      ]
   )

   const trackSecondsWatched = useCallback(
      (secondsWatched: number) => {
         if (!currentSparkId || !visitorId) return

         const secondWatched: SparkSecondWatchedClient = {
            sparkId: currentSparkId,
            sessionId,
            videoEventPositionInSeconds: secondsWatched,
            universityCountry: userData?.universityCountryCode || null,
            stringTimestamp: new Date().toISOString(),
            visitorId,
         }
         addSecondsWatchedToBatch(secondWatched)
      },
      [
         addSecondsWatchedToBatch,
         currentSparkId,
         sessionId,
         userData?.id,
         userData?.universityCountryCode,
         visitorId,
      ]
   )

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
         "useSparksFeedTracker must be used within a SparksFeedTrackerProvider"
      )
   }
   return context
}

const generatSessionId = (sparkId: string) => {
   const timestamp = new Date().toISOString()
   return `spark-${sparkId}-${timestamp}-${uuidv4()}`
}

export default SparksFeedTrackerProvider
