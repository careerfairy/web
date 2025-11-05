import { useRouter } from "next/router"
import { useEffect } from "react"
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

   useEffect(() => {
      // Check if showConsent query parameter is present
      if (router.query.showConsent === "true") {
         // Wait for Usercentrics UI to be available
         const checkAndShowConsent = () => {
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
               const cleanup = onConsentChange((detail) => {
                  try {
                     analyticsTrackEvent(AnalyticsEvents.ConsentChoiceMade, {
                        choice: detail.type, // ACCEPT_ALL, DENY_ALL, or SAVE
                        page: router.pathname,
                     })
                  } catch (error) {
                     console.error("Failed to track consent choice:", error)
                  }
               })

               // Clean up listener after 30 seconds (dialog interaction complete)
               setTimeout(cleanup, 30000)

               // Open the consent dialog
               ucUI.showSecondLayer()

               // Remove the query parameter from URL to clean it up
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
               // UC_UI not ready yet, retry after a short delay
               setTimeout(checkAndShowConsent, 100)
            }
         }

         // Start checking for UC_UI availability
         checkAndShowConsent()
      }
   }, [router.query.showConsent, router])
}

export default useShowConsent
