import {
   SparkEventActionType,
   SparkEventClient,
   SparkSecondWatchedClient,
} from "@careerfairy/shared-lib/sparks/analytics"
import { useAuth } from "HOCs/AuthProvider"
import { sparkService } from "data/firebase/SparksService"
import { useRouter } from "next/router"
import { FC, createContext, useCallback, useContext, useMemo } from "react"
import { useSelector } from "react-redux"
import {
   currentSparkIdSelector,
   sessionIdSelector,
} from "store/selectors/sparksFeedSelectors"
import useFingerPrint from "../../components/custom-hook/useFingerPrint"
import { OnProgressProps } from "react-player/base"
import useBatchedEvents from "components/custom-hook/utils/useBatchedEvents"

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
      (event: OnProgressProps) => {
         if (!currentSparkId) return

         const secondWatched: SparkSecondWatchedClient = {
            sparkId: currentSparkId,
            sessionId,
            sparkLength: event.loadedSeconds,
            sparkPosition: event.playedSeconds,
            universityCountry: userData?.universityCountryCode || null,
            stringTimestamp: new Date().toISOString(),
            userId: userData?.id || null,
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

export default SparksFeedTrackerProvider
