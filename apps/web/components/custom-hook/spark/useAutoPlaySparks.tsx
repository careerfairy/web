import { EmblaCarouselType } from "embla-carousel-react"
import { useCallback, useEffect, useState } from "react"
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
   const [isCarouselInView, setIsCarouselInView] = useState<boolean>(false)

   const handleSlidesInView = useCallback((emblaApi: EmblaCarouselType) => {
      const hasSlides = emblaApi.slidesInView().length > 0
      setIsCarouselInView(hasSlides)
   }, [])

   const moveToNextSlide = useCallback(() => {
      if (!isCarouselInView || numberOfElementsToPlay === null) return

      setAutoPlayingIndex((prevIndex) => {
         return (prevIndex + 1) % numberOfElementsToPlay
      })

      if (autoPlayingIndex === numberOfElementsToPlay - 1) {
         emblaApi.scrollTo(0)
      } else {
         emblaApi.scrollNext()
      }
   }, [autoPlayingIndex, emblaApi, isCarouselInView, numberOfElementsToPlay])

   const shouldDisableAutoPlay = useCallback(
      (index: number) => {
         return isMobile && isCarouselInView && autoPlayingIndex !== index
      },
      [isMobile, isCarouselInView, autoPlayingIndex]
   )

   useEffect(() => {
      if (emblaApi) {
         emblaApi.on("slidesInView", handleSlidesInView)
      }
   }, [emblaApi, handleSlidesInView])

   return {
      shouldDisableAutoPlay,
      moveToNextSlide,
   }
}
