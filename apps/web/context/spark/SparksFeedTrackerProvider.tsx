import {
   SparkEventActionType,
   SparkEventActions,
   SparkEventClient,
   SparkSecondWatchedClient,
} from "@careerfairy/shared-lib/sparks/telemetry"
import { useAuth } from "HOCs/AuthProvider"
import useBatchedEvents from "components/custom-hook/utils/useBatchedEvents"
import { sparkService } from "data/firebase/SparksService"
import { useRouter } from "next/router"
import { FC, createContext, useCallback, useContext, useMemo } from "react"
import { useSelector } from "react-redux"
import {
   activeSparkSelector,
   currentSparkIdSelector,
   interactionSourceSelector,
   isOnFirstSparkSelector,
   originalSparkIdSelector,
} from "store/selectors/sparksFeedSelectors"
import CookiesUtil from "util/CookiesUtil"
import { AnalyticsEvents } from "util/analyticsConstants"
import { dataLayerSparkEvent } from "util/analyticsUtils"
import { v4 as uuidv4 } from "uuid"
import useFingerPrint from "../../components/custom-hook/useFingerPrint"

const BATCH_SIZE = 10 // Maximum number of events that can be batched
const BATCH_INTERVAL = 5000 // Interval for sending batched events (in ms)

type SparkEventTrackerProviderProps = {
   trackEvent: (
      event: SparkEventActionType,
      optionalVariables?: Record<string, any>
   ) => void
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
export const SparksFeedTrackerProvider: FC<{
   children: React.ReactNode
}> = ({ children }) => {
   const router = useRouter()

   const { userData } = useAuth()

   const { data: visitorId } = useFingerPrint()

   const currentSparkId = useSelector(currentSparkIdSelector)
   const currentSpark = useSelector(activeSparkSelector)
   const originalSparkId = useSelector(originalSparkIdSelector)
   const isFirstSpark = useSelector(isOnFirstSparkSelector)
   const categoryId = currentSpark?.category?.id || null
   const groupId = currentSpark?.group.id || null
   const interactionSource = useSelector(interactionSourceSelector) || null

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
      return generatSessionId(currentSparkId, visitorId)
   }, [currentSparkId, visitorId])

   const trackEvent = useCallback(
      (
         event: SparkEventActionType,
         optionalVariables?: Record<string, any>
      ) => {
         if (!currentSparkId || !visitorId) return

         const referrer = document?.referrer || null

         // Get UTM parameters from cookies
         const utmParams = CookiesUtil.getUTMParams() || {}

         // Only use UTM parameters if it's the first spark
         const {
            utm_source = null,
            utm_medium = null,
            utm_campaign = null,
            utm_term = null,
            utm_content = null,
         } = isFirstSpark ? utmParams : {}

         const { referral = null } = router.query

         const options: SparkEventClient = {
            visitorId,
            actionType: event,
            originalSparkId,
            categoryId,
            utm_source,
            utm_medium,
            utm_campaign,
            utm_term,
            utm_content,
            groupId,
            referralCode: referral ? referral.toString() : null,
            sparkId: currentSparkId,
            referrer,
            universityCountry: userData?.universityCountryCode || null,
            fieldOfStudy: userData?.fieldOfStudy?.id || null,
            levelOfStudy: userData?.levelOfStudy?.id || null,
            universityId: userData?.university?.code || null,
            universityName: userData?.university?.name || null,
            sessionId,
            stringTimestamp: new Date().toISOString(),
            interactionSource,
         }

         switch (options.actionType) {
            case SparkEventActions.Register_Event:
               dataLayerSparkEvent(
                  AnalyticsEvents.SparkRegisterEvent,
                  currentSpark,
                  {
                     livestreamId: optionalVariables?.livestreamId,
                  }
               )
               break
            case SparkEventActions.Like:
               sparkService.incrementSparkCount(currentSparkId, "likes")
               dataLayerSparkEvent(AnalyticsEvents.SparkLike, currentSpark)
               break
            case SparkEventActions.Unlike:
               sparkService.incrementSparkCount(currentSparkId, "likes", -1)
               dataLayerSparkEvent(AnalyticsEvents.SparkUnlike, currentSpark)
               break
            case SparkEventActions.Impression:
               sparkService.incrementSparkCount(currentSparkId, "impressions")
               dataLayerSparkEvent(
                  AnalyticsEvents.SparkFeedImpression,
                  currentSpark
               )
               break
            case SparkEventActions.Played_Spark:
               sparkService.incrementSparkCount(currentSparkId, "plays")
               dataLayerSparkEvent(AnalyticsEvents.SparkPlayed, currentSpark)
               break
            case SparkEventActions.Click_CompanyPageCTA:
               sparkService.incrementSparkCount(
                  currentSparkId,
                  "numberOfCompanyPageClicks"
               )
               dataLayerSparkEvent(
                  AnalyticsEvents.SparkClickCompanyPageCTA,
                  currentSpark
               )
               break
            case SparkEventActions.Watched_CompleteSpark:
               sparkService.incrementSparkCount(
                  currentSparkId,
                  "numberTimesCompletelyWatched"
               )
               dataLayerSparkEvent(
                  AnalyticsEvents.SparkWatchedComplete,
                  currentSpark
               )
               break
            case SparkEventActions.Click_DiscoverLivestreamCTA:
               dataLayerSparkEvent(
                  AnalyticsEvents.SparkClickDiscoverEventCTA,
                  currentSpark,
                  {
                     livestreamId: optionalVariables?.livestreamId,
                  }
               )
               break
            case SparkEventActions.Click_JobCTA:
               dataLayerSparkEvent(
                  AnalyticsEvents.SparkClickJobCTA,
                  currentSpark,
                  {
                     jobIds: optionalVariables?.jobIds,
                  }
               )
               break
            case SparkEventActions.Click_MentorPageCTA:
               dataLayerSparkEvent(
                  AnalyticsEvents.SparkClickMentorPageCTA,
                  currentSpark
               )
               break
            case SparkEventActions.Click_ReachOut_LinkedIn:
               dataLayerSparkEvent(
                  AnalyticsEvents.SparkClickReachOutLinkedIn,
                  currentSpark
               )
               break
            case SparkEventActions.Share_Clipboard:
               dataLayerSparkEvent(
                  AnalyticsEvents.SparkShareClipboard,
                  currentSpark
               )
            // falls through
            case SparkEventActions.Share_Email:
               dataLayerSparkEvent(
                  AnalyticsEvents.SparkShareEmail,
                  currentSpark
               )
            // falls through
            case SparkEventActions.Share_Facebook:
               dataLayerSparkEvent(
                  AnalyticsEvents.SparkShareFacebook,
                  currentSpark
               )
            // falls through
            case SparkEventActions.Share_LinkedIn:
               dataLayerSparkEvent(
                  AnalyticsEvents.SparkShareLinkedIn,
                  currentSpark
               )
            // falls through
            case SparkEventActions.Share_Mobile:
               dataLayerSparkEvent(
                  AnalyticsEvents.SparkShareMobile,
                  currentSpark
               )
            // falls through
            case SparkEventActions.Share_X:
               dataLayerSparkEvent(AnalyticsEvents.SparkShareX, currentSpark)
            // falls through
            case SparkEventActions.Share_WhatsApp:
               dataLayerSparkEvent(
                  AnalyticsEvents.SparkShareWhatsApp,
                  currentSpark
               )
            // falls through
            case SparkEventActions.Share_Other:
               dataLayerSparkEvent(
                  AnalyticsEvents.SparkShareOther,
                  currentSpark
               )
               sparkService.incrementSparkCount(currentSparkId, "shareCTA")
               break
         }

         addEventToBatch(options)
      },
      [
         currentSparkId,
         visitorId,
         isFirstSpark,
         router.query,
         originalSparkId,
         categoryId,
         groupId,
         userData?.universityCountryCode,
         userData?.fieldOfStudy?.id,
         userData?.levelOfStudy?.id,
         userData?.university?.code,
         userData?.university?.name,
         sessionId,
         interactionSource,
         addEventToBatch,
         currentSpark,
      ]
   )

   const trackSecondsWatched = useCallback(
      (secondsWatched: number) => {
         if (!currentSparkId || !visitorId || secondsWatched < 1) return
         sparkService.incrementSparkCount(
            currentSparkId,
            "totalWatchedMinutes",
            1 / 60
         )

         const secondWatched: SparkSecondWatchedClient = {
            sparkId: currentSparkId,
            categoryId: categoryId,
            sessionId,
            videoEventPositionInSeconds: secondsWatched,
            universityCountry: userData?.universityCountryCode || null,
            stringTimestamp: new Date().toISOString(),
            visitorId,
            fieldOfStudy: userData?.fieldOfStudy?.id || null,
            levelOfStudy: userData?.levelOfStudy?.id || null,
            universityId: userData?.university?.code || null,
            universityName: userData?.university?.name || null,
            interactionSource,
         }

         addSecondsWatchedToBatch(secondWatched)
      },
      [
         addSecondsWatchedToBatch,
         currentSparkId,
         categoryId,
         sessionId,
         userData?.fieldOfStudy?.id,
         userData?.levelOfStudy?.id,
         userData?.university?.code,
         userData?.university?.name,
         userData?.universityCountryCode,
         visitorId,
         interactionSource,
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

const generatSessionId = (sparkId: string, visitorId: string) => {
   const timestamp = new Date().toISOString()
   return `spark-${sparkId}-${timestamp}-${uuidv4()}-${visitorId || ""}`
}

export default SparksFeedTrackerProvider
