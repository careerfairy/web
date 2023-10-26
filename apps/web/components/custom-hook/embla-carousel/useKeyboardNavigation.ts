import { EmblaCarouselType } from "embla-carousel-react"
import { useEffect } from "react"

type NavigationMode = "upDown" | "leftRight"

type Options = {
   disabled?: boolean
   mode?: NavigationMode
}

/**
 * Custom React hook for adding keyboard navigation to an Embla Carousel.
 *
 * @param {EmblaCarouselType} emblaApi - The Embla API object.
 * @param {NavigationMode} mode - The navigation mode, either "upDown" or "leftRight".
 * @param {boolean} disabled - Whether the keyboard navigation should be disabled.
 *
 * @example
 * const emblaApi = useEmblaCarousel(options);
 * useKeyboardNavigation(emblaApi, 'upDown');
 *
 * @returns {void} Returns void as it doesn't provide any value to consume.
 */
const useKeyboardNavigation = (
   emblaApi: EmblaCarouselType,
   options?: Options
) => {
   const mode = options?.mode || "upDown"
   const disabled = options?.disabled || false

   useEffect(() => {
      /**
       * Event handler for keyboard events. Scrolls the Embla carousel
       * to the next or previous slide based on the defined mode.
       *
       * @param {KeyboardEvent} event - The keyboard event object.
       */
      const handleKeyDown = (event: KeyboardEvent) => {
         if (!emblaApi || disabled) return

         switch (mode) {
            case "upDown":
               if (event.key === "ArrowDown") {
                  emblaApi.scrollNext()
               } else if (event.key === "ArrowUp") {
                  emblaApi.scrollPrev()
               }
               break

            case "leftRight":
               if (event.key === "ArrowRight") {
                  emblaApi.scrollNext()
               } else if (event.key === "ArrowLeft") {
                  emblaApi.scrollPrev()
               }
               break
         }
      }

      // Attach the event listener
      window.addEventListener("keydown", handleKeyDown)

      // Cleanup: Remove the event listener when the component unmounts
      return () => {
         window.removeEventListener("keydown", handleKeyDown)
      }
   }, [disabled, emblaApi, mode])

   return
}

export default useKeyboardNavigation
