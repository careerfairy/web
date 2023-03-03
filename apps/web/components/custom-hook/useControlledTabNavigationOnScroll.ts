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
   const [updating, setUpdating] = useState<boolean>(false)

   const handleChangeClick = (e, newValue: string) => {
      setValue(newValue)
      setUpdating(true)
      setTimeout(() => {
         setUpdating(false)
      }, CHANGE_DELAY)
   }

   const handleChange = debounce((_, newValue) => {
      setValue(newValue)
   }, CHANGE_DELAY)

   useEffect(
      () => {
         // @ts-ignore
         if (!"IntersectionObserver" in window || updating) {
            // this browser doesn't seem to support the IntersectionObserver API, do nothing
            return
         }

         let observer

         if (refs.length) {
            observer = new IntersectionObserver(
               (entries) => {
                  entries.forEach((entry, index) => {
                     const entryId = entry.target.id

                     const diff = getDifference(
                        index,
                        entries.findIndex((entry) => entry.target.id === value)
                     )

                     if (entry.isIntersecting && diff === 1) {
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

   return [value, handleChangeClick] as const
}

const getDifference = (a: number, b: number) => {
   return Math.abs(a - b)
}

export default useControlledTabNavigationOnScroll
