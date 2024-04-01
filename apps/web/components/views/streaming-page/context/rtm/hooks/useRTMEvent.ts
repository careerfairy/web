import { useEffect, useRef } from "react"
import { useIsomorphicLayoutEffect } from "react-use"
import { Fn, Listenable, Nullable, listen } from "./util"

/**
 * Custom hook to manage RTM (Real-Time Messaging) events.
 *
 * @param target - The event target, RTM channel or client.
 * @param event - The name of the event to listen for.
 * @param listener - The callback function to execute when the event is triggered.
 */
function useRTMEvent(
   target: Nullable<Listenable>,
   event: string,
   listener: Nullable<Fn>
) {
   const listenerRef = useRef<Nullable<Fn>>(listener)

   useIsomorphicLayoutEffect(() => {
      listenerRef.current = listener
   }, [listener])

   // Effect to attach and detach(subscribe and unsubscribe) the event listener.
   useEffect(() => {
      if (target) {
         const disposer = listen(target, event, (...args: unknown[]) => {
            listenerRef.current?.(...args)
         })
         return disposer
      }
   }, [event, target])
}

export default useRTMEvent
