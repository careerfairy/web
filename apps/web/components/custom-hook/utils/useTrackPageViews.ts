import { useRouter } from "next/router"
import { useEffect } from "react"
import { analyticsTrackPageView } from "../../../util/analyticsUtils"

/**
 * Custom hook to track page views in the application
 * Tracks page views on client-side route changes
 * Note: Initial page view is already tracked by Customer.io script on load
 */
export const useTrackPageViews = () => {
   const router = useRouter()

   useEffect(() => {
      const handleRouteChange = () => {
         analyticsTrackPageView()
      }

      router.events.on("routeChangeComplete", handleRouteChange)

      return () => {
         router.events.off("routeChangeComplete", handleRouteChange)
      }
   }, [router.events])
}
