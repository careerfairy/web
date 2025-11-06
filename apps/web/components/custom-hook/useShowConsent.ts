import { useRouter } from "next/router"
import { useEffect, useRef } from "react"
import { AnalyticsEvents } from "../../util/analyticsConstants"
import { analyticsTrackEvent } from "../../util/analyticsUtils"
import {
   hasUserDeclinedConsent,
   onConsentChange,
   waitForUsercentrics,
} from "../../util/ConsentUtils"
import { getWindow } from "../../util/PathUtils"

/**
 * Custom hook to automatically show the Usercentrics consent dialog
 * when the URL contains ?showConsent=true query parameter.
 *
 * The dialog will ONLY show for users who have previously declined cookies.
 * First-time visitors or users who have already accepted will not see the dialog.
 *
 * Can be used in email campaigns or notifications to re-engage users who
 * previously declined consent.
 */
const useShowConsent = () => {
   const router = useRouter()
   const cleanupRef = useRef<(() => void) | null>(null)
   type TimeoutHandle = ReturnType<typeof setTimeout> | number

   const timeoutRef = useRef<TimeoutHandle | null>(null)
   const hasSetupListenerRef = useRef(false)

   useEffect(() => {
      if (!router.isReady) return

      if (router.query.showConsent !== "true" || hasSetupListenerRef.current) {
         return
      }

      const abortController = new AbortController()
      let isActive = true

      const removeShowConsentQueryParam = () => {
         const { showConsent: _showConsent, ...remainingQuery } = router.query

         void router.replace(
            {
               pathname: router.pathname,
               query: remainingQuery,
            },
            undefined,
            { shallow: true }
         )
      }

      const setupConsentListener = () => {
         let removeListener: (() => void) | null = null

         const cleanup = () => {
            if (timeoutRef.current) {
               clearTimeout(timeoutRef.current)
               timeoutRef.current = null
            }

            if (removeListener) {
               removeListener()
               removeListener = null
            }

            cleanupRef.current = null
            hasSetupListenerRef.current = false
         }

         removeListener = onConsentChange((detail) => {
            try {
               analyticsTrackEvent(AnalyticsEvents.ConsentChoiceMade, {
                  choice: detail.type,
                  page: router.pathname,
               })
            } catch (error) {
               console.error("Failed to track consent choice:", error)
            }

            cleanup()
         })

         cleanupRef.current = cleanup
         hasSetupListenerRef.current = true

         return cleanup
      }

      const openConsentDialog = async () => {
         const ucUI = await waitForUsercentrics({
            signal: abortController.signal,
         })

         if (!isActive) return

         if (!ucUI || typeof ucUI.showSecondLayer !== "function") {
            console.warn(
               "Usercentrics UI not available. The consent dialog cannot be shown."
            )
            return
         }

         const userHasDeclined = hasUserDeclinedConsent()

         if (!userHasDeclined) {
            removeShowConsentQueryParam()
            return
         }

         try {
            analyticsTrackEvent(AnalyticsEvents.ConsentDialogOpened, {
               page: router.pathname,
               url: getWindow()?.location?.href,
               userPreviouslyDeclined: true,
            })
         } catch (error) {
            console.error("Failed to track consent dialog event:", error)
         }

         const cleanupConsentListener = setupConsentListener()

         timeoutRef.current = window.setTimeout(() => {
            timeoutRef.current = null
            cleanupConsentListener()
         }, 30000)

         ucUI.showSecondLayer()
         removeShowConsentQueryParam()
      }

      void openConsentDialog()

      return () => {
         isActive = false
         abortController.abort()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [router.isReady, router.query.showConsent])

   // Separate effect for cleanup on unmount only
   useEffect(() => {
      return () => {
         if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
         }
         if (cleanupRef.current) {
            cleanupRef.current()
            cleanupRef.current = null
         }
         hasSetupListenerRef.current = false
      }
   }, [])
}

export default useShowConsent
