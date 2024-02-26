import { useEffect, useState } from "react"

/**
 * Custom hook to delay the update of a value.
 * @param value The value to delay.
 * @param delay The delay in milliseconds.
 * @returns The delayed value.
 */
export const useDelayedValue = <T>(value: T, delay: number): T => {
   const [delayedValue, setDelayedValue] = useState(value)

   useEffect(() => {
      // Set up a timeout to update the delayed value after the specified delay
      const handler = setTimeout(() => {
         setDelayedValue(value)
      }, delay)

      // Clear the timeout if the component unmounts or the value/delay changes
      return () => {
         clearTimeout(handler)
      }
   }, [value, delay]) // Only re-run the effect if value or delay changes

   return delayedValue
}
