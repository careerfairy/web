import { EmblaCarouselType } from "embla-carousel-react"
import { useEffect } from "react"

type Options = {
   disabled?: boolean
}
/**
 * Custom React hook for adding vertical mouse scroll navigation to an Embla Carousel.
 *
 * @param {EmblaCarouselType} emblaApi - The Embla API object.
 * @param {boolean} disabled - Whether the vertical mouse scroll navigation should be disabled.
 *
 * @example
 * const emblaApi = useEmblaCarousel(options);
 * useVerticalMouseScrollNavigation(emblaApi);
 *
 * @returns {void} Returns void as it doesn't provide any value to consume.
 */
const useVerticalMouseScrollNavigation = (
   emblaApi: EmblaCarouselType,
   options?: Options
) => {
   const disabled = options?.disabled || false

   useEffect(() => {
      if (disabled) return
      /**
       * Event handler for mouse wheel events. Scrolls the Embla carousel
       * to the next or previous slide based on the vertical scroll direction.
       *
       * @param {WheelEvent} event - The wheel event object.
       */
      const handleWheel = (event: WheelEvent) => {
         if (!emblaApi) return

         if (event.deltaY > 0) {
            emblaApi.scrollNext()
         } else if (event.deltaY < 0) {
            emblaApi.scrollPrev()
         }
      }

      // Attach the event listener with throttling
      const throttledHandleWheel = throttle(handleWheel, 1800)
      window.addEventListener("wheel", throttledHandleWheel, { passive: true })

      // Cleanup: Remove the event listener when the component unmounts
      return () => {
         window.removeEventListener("wheel", throttledHandleWheel)
      }
   }, [disabled, emblaApi])

   return
}

/**
 * Throttles a function, allowing it to be called at most once every N milliseconds.
 *
 * @param {Function} func - The function to be throttled.
 * @param {number} limit - The time, in milliseconds, that needs to pass before the function can be called again.
 *
 * @returns {Function} A new, throttled function.
 *
 * @example
 * const throttledFunc = throttle(() => {
 *   console.log("Throttled function called!");
 * }, 300);
 *
 * // Usage
 * throttledFunc();
 */
const throttle = (func: Function, limit: number) => {
   let inThrottle: boolean
   return function () {
      const args = arguments
      const context = this
      if (!inThrottle) {
         func.apply(context, args)
         inThrottle = true
         setTimeout(() => (inThrottle = false), limit)
      }
   }
}

export default useVerticalMouseScrollNavigation
