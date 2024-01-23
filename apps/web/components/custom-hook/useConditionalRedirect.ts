import { useEffect, useRef } from "react"
import { useRouter } from "next/router"

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
   const router = useRouter()
   const hasRedirected = useRef(false)

   useEffect(() => {
      if (shouldRedirect && !hasRedirected.current) {
         router.replace(targetUrl)
         hasRedirected.current = true
      }
   }, [shouldRedirect, targetUrl, router])
}
