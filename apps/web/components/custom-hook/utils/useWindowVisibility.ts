import { useEffect, useState } from "react"

/**
 * Custom hook to track the visibility state of the window.
 * @returns {boolean} - Returns true if the window is visible, false otherwise.
 */
export const useWindowVisibility = (): boolean => {
   const [isWindowVisible, setIsWindowVisible] = useState(!document.hidden)

   useEffect(() => {
      const handleVisibilityChange = () => {
         setIsWindowVisible(!document.hidden)
      }

      document.addEventListener("visibilitychange", handleVisibilityChange)

      return () => {
         document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange
         )
      }
   }, [])

   return isWindowVisible
}
