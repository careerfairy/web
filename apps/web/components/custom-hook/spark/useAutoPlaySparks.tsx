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

   const { areSlidesInView } = useAreSlidesInView(emblaApi)

   const [isUserScrolling, setIsUserScrolling] = useState(false)

   const getSlideToPlayAfterScroll = useCallback(() => {
      if (!isMobile || !emblaApi?.slideNodes()) return null

      const viewportBoundingRect = emblaApi.rootNode().getBoundingClientRect()
      const viewportLeft = viewportBoundingRect.left
      const viewportRight = viewportBoundingRect.right

      // Embla appends an extra node to the end of the carousel
      // to ensure the last slide is fully visible (I think...)
      // so we need to filter out the extra node
      const slideNodes = emblaApi.slideNodes().slice(0, -1)

      let firstVisibleIndex = null
      let lastVisibleIndex = null

      for (let i = 0; i < slideNodes.length; i++) {
         const slideBoundingRect = slideNodes[i].getBoundingClientRect()

         const isFullyVisible =
            slideBoundingRect.left >= viewportLeft &&
            slideBoundingRect.right <= viewportRight

         if (isFullyVisible) {
            if (firstVisibleIndex === null) {
               firstVisibleIndex = i
            }
            lastVisibleIndex = i
         }
      }

      // In case the user scroll to the end of the carousel,
      // we want to play the last slide
      if (lastVisibleIndex === slideNodes.length - 1) {
         return lastVisibleIndex
      }

      // Otherwise, we want to play the first slide that is fully visible
      return firstVisibleIndex
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
      if (!isMobile || !emblaApi) return

      const handleUserScrollStart = () => {
         if (!areSlidesInView) return

         setIsUserScrolling(true)
      }

      const handleSettle = () => {
         if (!isUserScrolling) return
         const indexToPlay = getSlideToPlayAfterScroll()

         setIsUserScrolling(false)
         setAutoPlayingIndex(indexToPlay)
      }

      emblaApi.on("pointerDown", handleUserScrollStart)
      emblaApi.on("settle", handleSettle)

      return () => {
         emblaApi.off("pointerDown", handleUserScrollStart)
         emblaApi.off("settle", handleSettle)
      }
   }, [
      areSlidesInView,
      autoPlayingIndex,
      emblaApi,
      getSlideToPlayAfterScroll,
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
