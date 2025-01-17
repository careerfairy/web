import { EmblaCarouselType } from "embla-carousel-react"
import { debounce } from "lodash"
import { useEffect, useState } from "react"

const VISIBILITY_THRESHOLD = 0.9

export const useAreSlidesInView = (
   emblaApi: EmblaCarouselType,
   debounceMs?: number
) => {
   const [areSlidesInView, setAreSlidesInView] = useState<boolean>(false)

   useEffect(() => {
      const rootNode = emblaApi?.rootNode()
      if (!rootNode) return

      // Wrap the visibility check in a debounced function if debounceMs is provided
      const updateVisibility = (entry: IntersectionObserverEntry) => {
         const isVisible =
            entry.boundingClientRect.height * VISIBILITY_THRESHOLD <=
            entry.intersectionRect.height

         setAreSlidesInView(isVisible)
      }

      const debouncedUpdate = debounceMs
         ? debounce(updateVisibility, debounceMs)
         : updateVisibility

      const observer = new IntersectionObserver(
         (entries) => {
            const entry = entries[0]
            if (!entry) return
            debouncedUpdate(entry)
         },
         {
            threshold: Array.from({ length: 11 }, (_, i) => i / 10),
         }
      )

      observer.observe(rootNode)
      return () => observer.disconnect()
   }, [emblaApi, debounceMs])

   return {
      areSlidesInView,
   }
}
