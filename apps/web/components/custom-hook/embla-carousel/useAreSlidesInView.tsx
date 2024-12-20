import { EmblaCarouselType } from "embla-carousel-react"
import { useEffect, useState } from "react"

const VISIBILITY_THRESHOLD = 0.9

export const useAreSlidesInView = (emblaApi: EmblaCarouselType) => {
   const [areSlidesInView, setAreSlidesInView] = useState<boolean>(false)

   useEffect(() => {
      const rootNode = emblaApi?.rootNode()
      if (!rootNode) return

      const observer = new IntersectionObserver(
         (entries) => {
            const entry = entries[0]
            if (!entry) return

            const isVisible =
               entry.boundingClientRect.height * VISIBILITY_THRESHOLD <=
               entry.intersectionRect.height

            setAreSlidesInView(isVisible)
         },
         {
            threshold: Array.from({ length: 11 }, (_, i) => i / 10),
         }
      )

      observer.observe(rootNode)
      return () => observer.disconnect()
   }, [emblaApi])

   return {
      areSlidesInView,
   }
}
