import { useEffect, useRef } from "react"
import { useIsomorphicLayoutEffect } from "react-use"
import { Fn, Listenable, Nullable, listen } from "./util"

function useRTMEvent(
   target: Nullable<Listenable>,
   event: string,
   listener: Nullable<Fn>
) {
   const listenerRef = useRef<Nullable<Fn>>(listener)

   useIsomorphicLayoutEffect(() => {
      listenerRef.current = listener
   }, [listener])

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
