import { useRouter } from "next/router"
import { useEffect, useRef } from "react"
import { AnalyticsEvents } from "../../util/analyticsConstants"
import { analyticsTrackEvent } from "../../util/analyticsUtils"
import { onConsentChange } from "../../util/ConsentUtils"
import { getWindow } from "../../util/PathUtils"

/**
 * Custom hook to automatically show the Usercentrics consent dialog
 * when the URL contains ?showConsent=true query parameter.
 *
 * Can be used in email campaigns, notifications, or other contexts where
 * users need to manage their consent preferences.
 */
const useShowConsent = () => {
   const router = useRouter()
   const cleanupRef = useRef<(() => void) | null>(null)
   const timeoutRef = useRef<NodeJS.Timeout | null>(null)
   const hasSetupListenerRef = useRef(false)

   useEffect(() => {
      // Check if showConsent query parameter is present
      if (router.query.showConsent === "true" && !hasSetupListenerRef.current) {
         const ucUI = getWindow()?.UC_UI

         if (ucUI && typeof ucUI.showSecondLayer === "function") {
            // Track that the consent dialog was opened via URL parameter
            try {
               analyticsTrackEvent(AnalyticsEvents.ConsentDialogOpened, {
                  page: router.pathname,
                  url: window.location.href,
               })
            } catch (error) {
               console.error("Failed to track consent dialog event:", error)
            }

            // Listen for consent decision
            const cleanupListener = onConsentChange((detail) => {
               try {
                  analyticsTrackEvent(AnalyticsEvents.ConsentChoiceMade, {
                     choice: detail.type, // ACCEPT_ALL, DENY_ALL, or SAVE
                     page: router.pathname,
                  })
               } catch (error) {
                  console.error("Failed to track consent choice:", error)
               }
            })

            // Store cleanup function in ref so it persists across effect re-runs
            cleanupRef.current = cleanupListener
            hasSetupListenerRef.current = true

            // Clean up listener after 30 seconds (dialog interaction complete)
            timeoutRef.current = setTimeout(() => {
               cleanupListener()
               cleanupRef.current = null
               timeoutRef.current = null
               hasSetupListenerRef.current = false
            }, 30000)

            // Open the consent dialog
            ucUI.showSecondLayer()

            // Remove the query parameter from URL to clean it up
            // This will cause the effect to re-run, but listener persists
            const { showConsent: _showConsent, ...remainingQuery } =
               router.query
            router.replace(
               {
                  pathname: router.pathname,
                  query: remainingQuery,
               },
               undefined,
               { shallow: true }
            )
         } else {
            console.warn(
               "Usercentrics UI not available. The consent dialog cannot be shown."
            )
         }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [router.query.showConsent])

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
