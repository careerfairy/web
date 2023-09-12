import { useRef, useEffect, useCallback } from "react"

type InUseStorageKeys = "unsentSparkEvents" | "unsentSparkSecondsWatched"

/**
 * A custom hook to batch events and send them either when the batch size is reached or at a specified interval.
 * Also, it stores unsent events in local storage and sends them when the page is reloaded.
 *
 * @param sendBatchedEvents - A function that sends the batched events.
 * @param batchSize - The maximum number of events to send in a batch, once this number is reached, the events are sent.
 * @param batchInterval - The interval at which to send the events if there are any.
 * @param localStorageKey - The key to use for storing unsent events in local storage.
 * @returns A function to add an event to the batch.
 */
const useBatchedEvents = <TEvent>(
   sendBatchedEvents: (events: TEvent[]) => Promise<unknown>,
   batchSize: number,
   batchInterval: number,
   localStorageKey: InUseStorageKeys
) => {
   const eventsBatch = useRef<TEvent[]>([])

   const addEventToBatch = useCallback(
      (event: TEvent) => {
         eventsBatch.current.push(event)

         if (eventsBatch.current.length >= batchSize) {
            sendBatchedEvents(eventsBatch.current).catch(console.error)
            eventsBatch.current = []
         }
      },
      [batchSize, sendBatchedEvents]
   )

   const sendRemainingEvents = useCallback(() => {
      if (eventsBatch.current.length > 0) {
         sendBatchedEvents(eventsBatch.current).catch(console.error)
         eventsBatch.current = []
      }
   }, [sendBatchedEvents])

   useEffect(() => {
      const intervalId = setInterval(sendRemainingEvents, batchInterval)

      return () => clearInterval(intervalId)
   }, [batchInterval, sendRemainingEvents])

   useEffect(() => {
      const handleBeforeUnload = () => {
         if (eventsBatch.current.length > 0) {
            localStorage.setItem(
               localStorageKey,
               JSON.stringify(eventsBatch.current)
            )
         }
      }

      window.addEventListener("beforeunload", handleBeforeUnload)

      const unsentEvents = JSON.parse(localStorage.getItem(localStorageKey))
      if (unsentEvents) {
         eventsBatch.current = unsentEvents
         sendRemainingEvents()
         localStorage.removeItem(localStorageKey)
      }

      return () =>
         window.removeEventListener("beforeunload", handleBeforeUnload)
   }, [sendRemainingEvents, localStorageKey])

   return addEventToBatch
}

export default useBatchedEvents
