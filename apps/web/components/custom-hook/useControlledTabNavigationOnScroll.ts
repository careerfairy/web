import debounce from "lodash/debounce"
import { RefObject, useEffect, useState } from "react"

/**
 * Uses IntersectionObserver API to detect which element is in view during scrolling.
 * Returns ID of visible element and a debounced handleChange function to update state.
 *
 * @param refs - Array of React refs pointing to observed elements.
 * @param options
 * @returns Tuple with current value and handleChange function.
 */

const CHANGE_DELAY = 700
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
   const [scrollingFromTabClicked, setScrollingFromTabClicked] =
      useState<boolean>(false)

   const handleChangeClick = (e, newValue: string) => {
      setValue(newValue)
      setScrollingFromTabClicked(true) // prevent IntersectionObserver from updating state

      setTimeout(() => {
         // wait for the scroll to finish before setting updating to false
         setScrollingFromTabClicked(false)
      }, CHANGE_DELAY)
   }

   const handleChange = debounce((_, newValue) => {
      setValue(newValue)
   }, CHANGE_DELAY)

   useEffect(
      () => {
         // @ts-ignore
         if (!"IntersectionObserver" in window || scrollingFromTabClicked) {
            // this browser doesn't seem to support the IntersectionObserver API, do nothing
            return
         }

         let observer

         if (refs.length) {
            observer = new IntersectionObserver(
               (entries) => {
                  const firstIntersecting = entries.find(
                     (entry) => entry.isIntersecting
                  )

                  const firstIntersectingId = firstIntersecting?.target?.id
                  if (!firstIntersectingId) return
                  // @ts-ignore
                  handleChange(_, firstIntersectingId)
               },
               {
                  threshold: options.threshold,
               }
            )

            refs.forEach((ref) => {
               if (ref?.current) {
                  observer.observe(ref.current)
               }
            })
         }
         return () => observer?.disconnect()
      },
      [refs] // eslint-disable-line react-hooks/exhaustive-deps
   )

   return [value, handleChangeClick] as const
}

export default useControlledTabNavigationOnScroll
