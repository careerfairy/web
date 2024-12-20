import { EmblaCarouselType } from "embla-carousel-react"
import { useCallback, useEffect, useState } from "react"
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
   const [hasPlayed, setHasPlayed] = useState(false)

   const { areSlidesInView } = useAreSlidesInView(emblaApi)

   const [isUserScrolling, setIsUserScrolling] = useState(false)

   const getMiddleSlideIndex = useCallback(() => {
      if (!isMobile || !emblaApi?.slideNodes()) return null

      const viewportBoundingRect = emblaApi.rootNode().getBoundingClientRect()
      const viewportMiddlePoint =
         viewportBoundingRect.left + viewportBoundingRect.width / 2

      const slideNodes = emblaApi.slideNodes()

      for (let i = 0; i < slideNodes.length; i++) {
         const slideBoundingRect = slideNodes[i].getBoundingClientRect()
         const slideMiddlePoint =
            slideBoundingRect.left + slideBoundingRect.width / 2

         if (Math.abs(slideMiddlePoint - viewportMiddlePoint) < 100) {
            return i
         }
      }

      return null
   }, [isMobile, emblaApi])

   const moveToNextSlide = useCallback(() => {
      if (
         !areSlidesInView ||
         isUserScrolling ||
         numberOfElementsToPlay === null
      )
         return

      setAutoPlayingIndex((prevIndex) => {
         const nextIndex = (prevIndex + 1) % numberOfElementsToPlay

         requestAnimationFrame(() => {
            emblaApi.scrollTo(nextIndex)
         })

         return nextIndex
      })
   }, [emblaApi, areSlidesInView, numberOfElementsToPlay, isUserScrolling])

   const shouldDisableAutoPlay = useCallback(
      (index: number) => {
         if (!areSlidesInView || isUserScrolling) return true

         return isMobile && areSlidesInView && autoPlayingIndex !== index
      },
      [isMobile, areSlidesInView, autoPlayingIndex, isUserScrolling]
   )

   useEffect(() => {
      if (autoPlayingIndex !== 0) {
         setHasPlayed(true)
      }

      return () => {
         setHasPlayed(false)
      }
   }, [autoPlayingIndex])

   useEffect(() => {
      if (!isMobile || !emblaApi) return

      const handleUserScrollStart = () => {
         if (!hasPlayed) return

         setIsUserScrolling(true)
      }

      const handleSettle = () => {
         if (!isUserScrolling) return

         setIsUserScrolling(false)
         setAutoPlayingIndex(getMiddleSlideIndex())
      }

      emblaApi.on("pointerDown", handleUserScrollStart)
      emblaApi.on("settle", handleSettle)

      return () => {
         emblaApi.off("pointerDown", handleUserScrollStart)
         emblaApi.off("settle", handleSettle)
      }
   }, [
      areSlidesInView,
      emblaApi,
      getMiddleSlideIndex,
      hasPlayed,
      isMobile,
      isUserScrolling,
   ])

   useEffect(() => {
      return () => {
         setAutoPlayingIndex(0)
         setIsUserScrolling(false)
      }
   }, [])

   return {
      shouldDisableAutoPlay,
      moveToNextSlide,
   }
}
