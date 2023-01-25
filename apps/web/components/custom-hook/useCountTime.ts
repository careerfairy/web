import { useCallback, useEffect, useState } from "react"

const ONE_MINUTE = 60

const useCountTime = (
   delayInSeconds: number = ONE_MINUTE,
   minSecondsToFirstCount: number = 20
) => {
   const [timeWatched, setTimeWatched] = useState(0)
   const [countedSeconds, setCountedSeconds] = useState(0)
   const [counting, setCounting] = useState(false)

   useEffect(() => {
      const timer = setInterval(() => {
         if (counting) {
            setCountedSeconds((prevTime) => prevTime + 1)
         }
      }, 1000)

      return () => {
         clearInterval(timer)
      }
   }, [counting])

   useEffect(() => {
      // first increase will be after user watched {minSecondsToFirstCount}
      if (countedSeconds === minSecondsToFirstCount) {
         setTimeWatched((prevTime) => prevTime + 1)
      }

      // will only increase after the 1st increment that is made by {minSecondsToFirstCount} time
      if (
         countedSeconds % delayInSeconds === 0 &&
         countedSeconds > delayInSeconds
      ) {
         setTimeWatched((prev) => prev + 1)
      }
   }, [countedSeconds])

   const startCounting = useCallback(() => {
      setCounting(true)
   }, [])

   const pauseCounting = useCallback(() => {
      setCounting(false)
   }, [])

   const resetMinutes = useCallback(() => {
      setCountedSeconds(0)
      setTimeWatched(0)
   }, [])

   return {
      timeWatched,
      countedSeconds,
      startCounting,
      pauseCounting,
      resetMinutes,
   }
}

export default useCountTime
