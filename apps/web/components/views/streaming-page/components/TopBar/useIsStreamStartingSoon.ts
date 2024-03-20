import { useState, useEffect } from "react"

const TWO_MINUTES = 1000 * 60 * 2

/**
 * Custom hook to determine if a stream is starting soon.
 *
 * It checks if the scheduled start time of the stream is within a two-minute threshold from the current time.
 * If so, it updates the state to indicate that the stream is starting soon.
 *
 * @param {Date | number | null} scheduledStartTime - The scheduled start time of the stream.
 * @returns {boolean} - Returns true if the stream is starting within two minutes, otherwise false.
 */
const useIsStreamStartingSoon = (
   scheduledStartTime: Date | number | null
): boolean => {
   const [isStartingSoon, setIsStartingSoon] = useState(false)

   useEffect(() => {
      if (scheduledStartTime) {
         const startTime = new Date(scheduledStartTime)

         const interval = setInterval(() => {
            if (isWithinStartThreshold(startTime, TWO_MINUTES)) {
               setIsStartingSoon(true)
               // Stop the interval once the stream is starting soon
               clearInterval(interval)
            }
         }, 1000)

         return () => clearInterval(interval)
      }
   }, [scheduledStartTime])

   return isStartingSoon
}

const isWithinStartThreshold = (startTime: Date, threshold: number) => {
   const timeDifference = new Date(startTime).getTime() - Date.now()

   return (
      timeDifference < threshold || Date.now() > new Date(startTime).getTime()
   )
}

export default useIsStreamStartingSoon
