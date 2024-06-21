import { useEffect, useMemo, useState } from "react"
import DateUtil from "util/DateUtil"

/**
 * Custom hook to calculate the countdown time to a specific date every second.
 *
 * @param time - The target date to count down to.
 * @returns An object containing the time left in days, hours, minutes, and seconds.
 */
export const useCountdownToDate = (time: Date | number) => {
   const dateTime = useMemo(() => {
      if (!time) return Date.now()
      return time instanceof Date ? time.getTime() : time
   }, [time])

   const [timeLeft, setTimeLeft] = useState(
      DateUtil.calculateTimeLeft(dateTime)
   )

   useEffect(() => {
      const interval = setInterval(() => {
         const newTimeLeft = DateUtil.calculateTimeLeft(dateTime)
         setTimeLeft(newTimeLeft)
      }, 1000)
      return () => clearInterval(interval)
   }, [dateTime])

   return timeLeft
}
