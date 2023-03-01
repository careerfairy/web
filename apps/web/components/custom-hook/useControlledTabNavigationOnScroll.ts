import { RefObject, useEffect, useState } from "react"
import debounce from "lodash.debounce"

/**
 * Uses IntersectionObserver API to detect which element is in view during scrolling.
 * Returns ID of visible element and a debounced handleChange function to update state.
 *
 * @param refs - Array of React refs pointing to observed elements.
 * @param initialValue - Initial value of visible element ID.
 * @returns Tuple with current value and handleChange function.
 */
const useControlledTabNavigationOnScroll = (
   refs: RefObject<HTMLElement>[],
   initialValue: string
) => {
   const [value, setValue] = useState<string>(initialValue)

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
         const availableRefs = refs.filter((ref) => ref.current)

         if (availableRefs.length) {
            const options = {
               threshold: 0.5,
            }

            observer = new IntersectionObserver((entries) => {
               entries.forEach((entry) => {
                  const entryId = entry.target.id
                  if (entry.isIntersecting) {
                     // @ts-ignore
                     handleChange(_, entryId)
                  }
               })
            }, options)

            availableRefs.forEach((ref) => observer.observe(ref.current))
         }
         return () => observer?.disconnect()
      },
      [refs] // eslint-disable-line react-hooks/exhaustive-deps
   )

   return [value, handleChange] as const
}

export default useControlledTabNavigationOnScroll
