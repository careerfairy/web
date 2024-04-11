import { RefObject, useCallback, useRef } from "react"

export type ScrollTo<T extends HTMLElement = HTMLDivElement> = {
   scrollToBottom: (behavior?: ScrollBehavior) => void
   scrollToTop: (behavior?: ScrollBehavior) => void
   ref: RefObject<T>
}

/**
 * Custom hook to scroll to the bottom of a given element.
 *
 * @template T The HTMLElement type that the ref will point to.
 * @returns An object containing a ref to the element and a scrollToBottom function.
 */
export const useScroll = <T extends HTMLElement>(): ScrollTo<T> => {
   const ref = useRef<T>(null)

   const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
      if (ref.current) {
         ref.current.scrollTo({
            top: ref.current.scrollHeight,
            behavior,
         })
      }
   }, [])

   const scrollToTop = useCallback((behavior: ScrollBehavior = "smooth") => {
      if (ref.current) {
         ref.current.scrollTo({
            top: 0,
            behavior,
         })
      }
   }, [])

   return { ref, scrollToBottom, scrollToTop }
}
