import { min } from "lodash"
import { useCallback, useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"
import useIsMobile from "../useIsMobile"

type ReturnType = {
   /** Function to determine if autoplay should be disabled for a specific element */
   shouldDisableAutoPlay: (index: number) => boolean
   /** Function to advance to the next element in the autoplay sequence */
   moveToNextElement: () => void
   /** Ref callback for the container element to track visibility */
   ref: (node?: Element | null) => void
   /** Handler for managing visibility changes of individual elements */
   handleInViewChange: (index: number) => (inView: boolean) => void
   /** Whether the autoplay is muted */
   muted: boolean
   /** Function to set the muted state */
   setMuted: (muted: boolean) => void
}

/**
 * A custom hook for managing auto-playing grid elements with visibility tracking.
 * This hook provides functionality to automatically play through grid elements when they're in view,
 * with special handling for mobile devices. If more than one element is in view, the first one will be auto-played.
 *
 * @returns An object containing functions and refs to manage the auto-play behavior:
 *          - shouldDisableAutoPlay: Function to check if auto-play should be disabled for an element
 *          - moveToNextElement: Function to advance to the next element
 *          - ref: Ref callback for the container element
 *          - handleInViewChange: Handler for element visibility changes
 *          - muted: Whether the autoplay is muted
 *          - setMuted: Function to set the muted state
 */
export const useAutoPlayGrid = (): ReturnType => {
   const isMobile = useIsMobile()
   const [autoPlayingIndex, setAutoPlayingIndex] = useState<number>(0)
   const [visibleElements, setVisibleElements] = useState<number[]>([])
   const [muted, setMuted] = useState(true)

   const { ref, inView: isContainerInView } = useInView()

   const moveToNextElement = useCallback(() => {
      if (!isContainerInView) return

      if (visibleElements.includes(autoPlayingIndex)) {
         setAutoPlayingIndex((prevIndex) => prevIndex + 1)
      }
   }, [isContainerInView, visibleElements, autoPlayingIndex])

   const shouldDisableAutoPlay = useCallback(
      (index: number) => {
         /**
          * For desktop, autoplay is only on hover
          * For mobile, autoplay starts automatically if element is in view
          */
         if (isMobile) {
            return (
               autoPlayingIndex !== index || !visibleElements.includes(index)
            )
         }

         return false
      },

      [isMobile, autoPlayingIndex, visibleElements]
   )

   const handleInViewChange = useCallback(
      (index: number) => (inView: boolean) => {
         setVisibleElements((prev) => {
            if (inView && !prev.includes(index)) {
               return [...prev, index]
            }
            if (!inView && prev.includes(index)) {
               return prev.filter((i) => i !== index)
            }
            return prev
         })
      },
      [setVisibleElements]
   )

   // If more than one element is visible, autoplay the first one
   useEffect(() => {
      if (visibleElements.length === 0) return

      if (!visibleElements.includes(autoPlayingIndex)) {
         setAutoPlayingIndex(min(visibleElements))
      }
      // Only run when visible elements change
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [visibleElements])

   const handleSetMuted = useCallback((newMuted: boolean) => {
      setMuted(newMuted)
   }, [])

   return {
      shouldDisableAutoPlay,
      moveToNextElement,
      ref,
      handleInViewChange,
      muted,
      setMuted: handleSetMuted,
   }
}
