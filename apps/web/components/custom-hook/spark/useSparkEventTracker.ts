import {
   SparkEventActionType,
   SparkEventClient,
} from "@careerfairy/shared-lib/sparks/analytics"
import { useAuth } from "HOCs/AuthProvider"
import { sparkService } from "data/firebase/SparksService"
import { useRouter } from "next/router"
import { useCallback, useMemo } from "react"
import { useSelector } from "react-redux"
import {
   originalSparkIdSelector,
   sessionIdSelector,
} from "store/selectors/sparksFeedSelectors"
import useFingerPrint from "../useFingerPrint"

const useSparkEventTracker = () => {
   const router = useRouter()
   const { data: visitorId } = useFingerPrint()
   const originalSparkId = useSelector(originalSparkIdSelector)
   const sessionId = useSelector(sessionIdSelector)
   const { userData } = useAuth()

   const trackEvent = useCallback(
      (event: SparkEventActionType, sparkId: string) => {
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
            sparkId,
            referrer,
            universityCountry: userData?.universityCountryCode || null,
            sessionId,
            stringTimestamp: new Date().toISOString(),
         }

         sparkService.trackSparkEvent(options).catch(console.error)
         alert(`Tracked ${event} for spark ${sparkId}`)
      },
      [
         router.query,
         visitorId,
         originalSparkId,
         userData?.universityCountryCode,
         sessionId,
      ]
   )

   return useMemo(() => ({ trackEvent }), [trackEvent])
}

export default useSparkEventTracker
