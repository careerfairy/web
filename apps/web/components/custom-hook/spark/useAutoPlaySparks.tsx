import { EmblaCarouselType } from "embla-carousel-react"
import { useCallback, useState } from "react"
import { useAreSlidesInView } from "../embla-carousel/useAreSlidesInView"
import useIsMobile from "../useIsMobile"

type ReturnType = {
   shouldDisableAutoPlay: (index: number) => boolean
   moveToNextSlide: () => void
}

export const useAutoPlaySparks = (
   numberOfElementsToPlay: number | null,
   emblaApi: EmblaCarouselType
): ReturnType => {
   const isMobile = useIsMobile()
   const [autoPlayingIndex, setAutoPlayingIndex] = useState<number>(0)

   const { areSlidesInView } = useAreSlidesInView(emblaApi)

   const moveToNextSlide = useCallback(() => {
      if (!areSlidesInView || numberOfElementsToPlay === null) return

      setAutoPlayingIndex((prevIndex) => {
         requestAnimationFrame(() => {
            if (prevIndex === numberOfElementsToPlay - 1) {
               emblaApi.scrollTo(0)
            } else {
               emblaApi.scrollNext()
            }
         })

         return (prevIndex + 1) % numberOfElementsToPlay
      })
   }, [emblaApi, areSlidesInView, numberOfElementsToPlay])

   const shouldDisableAutoPlay = useCallback(
      (index: number) => {
         if (!areSlidesInView) return true

         return isMobile && areSlidesInView && autoPlayingIndex !== index
      },
      [isMobile, areSlidesInView, autoPlayingIndex]
   )

   return {
      shouldDisableAutoPlay,
      moveToNextSlide,
   }
}
