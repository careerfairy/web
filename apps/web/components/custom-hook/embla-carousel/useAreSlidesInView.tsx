import { EmblaCarouselType } from "embla-carousel-react"
import { useEffect, useState } from "react"

export const useAreSlidesInView = (emblaApi: EmblaCarouselType) => {
   const [areSlidesInView, setAreSlidesInView] = useState<boolean>(false)

   useEffect(() => {
      if (emblaApi) {
         setAreSlidesInView(emblaApi.slideNodes().length > 0)
      }

      return () => {
         setAreSlidesInView(false)
      }
   }, [emblaApi])

   return {
      areSlidesInView,
   }
}
