import { useEffect, useState } from "react"

/**
 * A hook that delays updating a value by a specified delay time.
 * Useful for animations that need to wait for other animations to complete.
 */
export const useDelayedValue = <T>(value: T, delayMs: number): T => {
   const [delayedValue, setDelayedValue] = useState<T>(value)

   useEffect(() => {
      const timer = setTimeout(() => {
         setDelayedValue(value)
      }, delayMs)

      return () => clearTimeout(timer)
   }, [value, delayMs])

   return delayedValue
}
