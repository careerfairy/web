import { useEffect, useRef, useState } from "react"

/**
 * A hook that delays rendering until after window resizing has stabilized.
 *
 * @param {number} width - Current width of the container.
 * @param {number} height - Current height of the container.
 * @param {number} [delay=250] - Milliseconds to wait after resizing before confirming stabilization.
 * @returns {boolean} - True if resizing has stabilized, allowing rendering to proceed.
 */
export const useDebouncedResize = (
   width: number,
   height: number,
   delay: number = 250
) => {
   const [isReady, setIsReady] = useState(false)
   const resizeTimer = useRef<NodeJS.Timeout | null>(null)

   useEffect(() => {
      setIsReady(false) // Reset ready state on size change
      if (resizeTimer.current) {
         clearTimeout(resizeTimer.current)
      }
      resizeTimer.current = setTimeout(() => {
         setIsReady(true)
      }, delay) // Wait for delay ms of no size changes

      return () => {
         if (resizeTimer.current) {
            clearTimeout(resizeTimer.current)
         }
      }
   }, [width, height, delay])

   return isReady
}
