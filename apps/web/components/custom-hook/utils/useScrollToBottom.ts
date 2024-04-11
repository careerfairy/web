import { RefObject, useCallback, useRef } from "react"

export type ScrollToBottom<T extends HTMLElement = HTMLDivElement> = {
   scrollToBottom: (behavior?: ScrollBehavior) => void
   ref: RefObject<T>
}

/**
 * Custom hook to scroll to the bottom of a given element.
 *
 * @template T The HTMLElement type that the ref will point to.
 * @returns An object containing a ref to the element and a scrollToBottom function.
 */
export const useScrollToBottom = <
   T extends HTMLElement
>(): ScrollToBottom<T> => {
   const ref = useRef<T>(null)

   const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
      if (ref.current) {
         ref.current.scrollTo({
            top: ref.current.scrollHeight,
            behavior,
         })
      }
   }, [])

   return { ref, scrollToBottom }
}
