import { useEffect, useState } from "react"
import { useSessionStorage } from "react-use"

export interface UseArtificialLoadingOptions {
   /**
    * The minimum time in milliseconds the loading state should be shown
    * @default 1500
    */
   minLoadingTime?: number

   /**
    * Unique session storage key to track if loading has been shown
    * @default 'artificial-loading-shown'
    */
   sessionKey?: string
}

/**
 * Hook that manages artificial loading state with session persistence
 * Shows loading animation only once per browser session
 *
 * @param isLoading The actual loading state from data fetching
 * @param options Configuration options
 * @returns The final loading state (true if either actual loading or artificial loading is true)
 */
export const useArtificialLoading = (
   isLoading: boolean,
   options?: UseArtificialLoadingOptions
) => {
   const { minLoadingTime = 1500, sessionKey = "artificial-loading-shown" } =
      options || {}

   // Get/set whether loading has been shown this session
   const [hasShownLoadingThisSession, setHasShownLoadingThisSession] =
      useSessionStorage(sessionKey, false)

   // Initialize artificial loading based on session storage
   const [artificialLoading, setArtificialLoading] = useState(
      !hasShownLoadingThisSession
   )

   useEffect(() => {
      let timeoutId: NodeJS.Timeout

      if (isLoading) {
         // Only show artificial loading if it hasn't been shown this session
         setArtificialLoading(!hasShownLoadingThisSession)
      } else {
         // If we're showing artificial loading, ensure it lasts the minimum time
         if (!hasShownLoadingThisSession) {
            timeoutId = setTimeout(() => {
               setArtificialLoading(false)
               setHasShownLoadingThisSession(true)
            }, minLoadingTime)
         } else {
            setArtificialLoading(false)
         }
      }

      return () => {
         if (timeoutId) {
            clearTimeout(timeoutId)
         }
      }
   }, [
      isLoading,
      hasShownLoadingThisSession,
      setHasShownLoadingThisSession,
      minLoadingTime,
   ])

   // Return the combined loading state
   return isLoading || artificialLoading
}
