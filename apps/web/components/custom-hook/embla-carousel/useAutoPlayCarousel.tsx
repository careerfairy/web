import { EmblaCarouselType } from "embla-carousel-react"
import { useCallback, useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"
import useIsMobile from "../useIsMobile"

type ReturnType = {
   shouldDisableAutoPlay: (index: number) => boolean
   moveToNextSlide: () => void
   ref: (node?: Element | null) => void
   muted: boolean
   setMuted: (muted: boolean) => void
}

export const useAutoPlayCarousel = (
   numberOfElementsToPlay: number | null,
   emblaApi: EmblaCarouselType
): ReturnType => {
   const isMobile = useIsMobile()
   const [autoPlayingIndex, setAutoPlayingIndex] = useState<number>(0)
   const [muted, setMuted] = useState(true)
   const { ref, inView: areSlidesInView } = useInView()

   const [isUserScrolling, setIsUserScrolling] = useState(false)

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

   const handleSetMuted = useCallback((newMuted: boolean) => {
      setMuted(newMuted)
   }, [])

   useEffect(() => {
      if (!emblaApi) return

      const onSelect = () => {
         // Get the current selected index
         const selectedIndex = emblaApi.selectedScrollSnap()
         setAutoPlayingIndex(selectedIndex)
      }

      // Subscribe to the select event
      emblaApi.on("select", onSelect)

      // Cleanup listener when component unmounts
      return () => {
         emblaApi.off("select", onSelect)
      }
   }, [emblaApi])

   useEffect(() => {
      return () => {
         setAutoPlayingIndex(0)
         setIsUserScrolling(false)
      }
   }, [])

   return {
      shouldDisableAutoPlay,
      moveToNextSlide,
      ref,
      muted,
      setMuted: handleSetMuted,
   }
}
