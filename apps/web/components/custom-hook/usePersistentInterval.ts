import { useSessionStorage } from "react-use"
import { useEffect } from "react"

/**
 * Like setInterval but survives new react renders and page refreshes.
 *
 * Saves a key in sessionStorage with the last time the interval was called
 *
 * @param intervalSeconds - Period of time in seconds to call the callback function
 * @param sessionStorageKey - Key to save the last time the interval was called in sessionStorage
 * @param memoizedCallback - Callback function to call
 */
const usePersistentInterval = (
   intervalSeconds: number,
   sessionStorageKey: string,
   memoizedCallback: () => any
) => {
   const [lastInterval, setLastInterval] = useSessionStorage(sessionStorageKey)

   useEffect(() => {
      let interval = intervalSeconds

      if (lastInterval) {
         try {
            const diffSeconds =
               (Date.now() - parseInt(lastInterval as string)) / 1000
            // seconds to the next interval run
            interval = Math.round(interval - diffSeconds)
         } catch (e) {
            console.error(e)
         }
      }

      const intervalId = setInterval(() => {
         // reset the interval to the desired period
         interval = intervalSeconds

         // save the last time the interval was called on sessionStorage
         setLastInterval(Date.now().toString())

         memoizedCallback()
      }, interval * 1000)

      return () => clearInterval(intervalId)
   }, [lastInterval, memoizedCallback, intervalSeconds, sessionStorageKey])
}

export default usePersistentInterval
