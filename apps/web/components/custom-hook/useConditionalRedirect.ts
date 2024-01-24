import { useEffect, useRef } from "react"

/**
 * Custom hook to perform a conditional redirect using Next.js router.
 *
 * @param {boolean} shouldRedirect - A boolean to determine if the redirect should occur.
 * @param {string} targetUrl - The URL to redirect to if the condition is met.
 */
export const useConditionalRedirect = (
   shouldRedirect: boolean,
   targetUrl: string
) => {
   const hasRedirected = useRef(false)

   useEffect(() => {
      if (shouldRedirect && !hasRedirected.current) {
         // we use the window.location.replace method instead of the router.replace method
         // As the router.replace method is inconsistent
         window.location.replace(targetUrl)
         hasRedirected.current = true
      }
   }, [shouldRedirect, targetUrl])
}
