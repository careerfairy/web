import { RefObject, useEffect, useState } from "react"
import debounce from "lodash.debounce"

/**
 * Uses IntersectionObserver API to detect which element is in view during scrolling.
 * Returns ID of visible element and a debounced handleChange function to update state.
 *
 * @param refs - Array of React refs pointing to observed elements.
 * @param options
 * @returns Tuple with current value and handleChange function.
 */
const useControlledTabNavigationOnScroll = (
   refs: RefObject<HTMLElement>[],
   options: {
      initialValue: string
      threshold?: number
   } = {
      initialValue: "",
      threshold: 0.5,
   }
) => {
   const [value, setValue] = useState<string>(options.initialValue)

   const handleChange = debounce((_, newValue) => {
      setValue(newValue)
   }, 700)

   useEffect(
      () => {
         // @ts-ignore
         if (!"IntersectionObserver" in window) {
            // this browser doesn't seem to support the IntersectionObserver API, do nothing
            return
         }

         let observer

         if (refs.length) {
            observer = new IntersectionObserver(
               (entries) => {
                  entries.forEach((entry) => {
                     const entryId = entry.target.id
                     if (entry.isIntersecting) {
                        // @ts-ignore
                        handleChange(_, entryId)
                     }
                  })
               },
               {
                  threshold: options.threshold,
               }
            )

            refs.forEach((ref) => observer.observe(ref.current))
         }
         return () => observer?.disconnect()
      },
      [refs] // eslint-disable-line react-hooks/exhaustive-deps
   )

   return [value, handleChange] as const
}

export default useControlledTabNavigationOnScroll
