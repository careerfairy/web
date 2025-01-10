import useIsMobile from "components/custom-hook/useIsMobile"
import { useRouter } from "next/router"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useLockBodyScroll } from "react-use"
import { useIsLiveStreamDialogOpen } from "../../live-stream/useIsLiveStreamDialogOpen"
import { HighlightsContextType } from "./HighlightsBlockContext"

export const useExpandManager = (
   highlights: HighlightsContextType["highlights"]
): {
   isExpanded: HighlightsContextType["isExpanded"]
   isPlayingExpanded: HighlightsContextType["isPlayingExpanded"]
   toggleExpandedPlaying: HighlightsContextType["toggleExpandedPlaying"]
   handleExpandCardClick: HighlightsContextType["handleExpandCardClick"]
   expandedPlayingIndex: HighlightsContextType["expandedPlayingIndex"]
   setExpandedPlayingIndex: HighlightsContextType["setExpandedPlayingIndex"]
} => {
   const router = useRouter()
   const isMobile = useIsMobile()
   const isLiveStreamDialogOpen = useIsLiveStreamDialogOpen()

   const [isBodyScrollLockedForMobile, setIsBodyScrollLockedForMobile] =
      useState<boolean>(false)
   useLockBodyScroll(isBodyScrollLockedForMobile)

   const [isPausedExpanded, setIsPausedExpanded] = useState<boolean>(false)

   const [expandedPlayingIndex, setExpandedPlayingIndex] =
      useState<number>(undefined)

   const isExpanded = useCallback(
      (index: number) => {
         return expandedPlayingIndex === index
      },
      [expandedPlayingIndex]
   )

   const isPlayingExpanded = useMemo(() => {
      return (
         expandedPlayingIndex !== undefined &&
         !isLiveStreamDialogOpen &&
         !isPausedExpanded
      )
   }, [expandedPlayingIndex, isLiveStreamDialogOpen, isPausedExpanded])

   const toggleExpandedPlaying = useCallback(() => {
      setIsPausedExpanded((prev) => !prev)
   }, [])

   const handleExpandCardClick = useCallback(
      (index: number) => {
         return () => {
            setExpandedPlayingIndex(index)
            void router.push(
               {
                  pathname: router.pathname,
                  query: {
                     ...router.query,
                     highlightId: highlights[index].id,
                  },
               },
               undefined,
               {
                  scroll: false,
                  shallow: true,
               }
            )
         }
      },
      [router, highlights]
   )

   useEffect(() => {
      setIsPausedExpanded(false)

      if (isMobile) {
         if (expandedPlayingIndex !== undefined) {
            setIsBodyScrollLockedForMobile(true)
         } else {
            setIsBodyScrollLockedForMobile(false)
         }
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [expandedPlayingIndex, isMobile])

   return {
      isExpanded,
      isPlayingExpanded,
      toggleExpandedPlaying,
      handleExpandCardClick,
      expandedPlayingIndex,
      setExpandedPlayingIndex,
   }
}
