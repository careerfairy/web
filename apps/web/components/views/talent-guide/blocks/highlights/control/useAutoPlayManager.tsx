import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useCallback, useEffect, useState } from "react"
import { HighlightsContextType } from "./HighlightsBlockContext"

export const useAutoPlayManager = (
   highlights: HighlightsContextType["highlights"],
   expandedPlayingIndex: HighlightsContextType["expandedPlayingIndex"],
   isLiveStreamDialogOpen: HighlightsContextType["isLiveStreamDialogOpen"],
   isExpanded: HighlightsContextType["isExpanded"]
): {
   shouldAutoPlay: HighlightsContextType["shouldAutoPlay"]
   autoPlayingIndex: HighlightsContextType["autoPlayingIndex"]
   setAutoPlayingIndex: HighlightsContextType["setAutoPlayingIndex"]
} => {
   const isMobile = useIsMobile()

   const [autoPlayingIndex, setAutoPlayingIndex] = useState<number>(
      isMobile ? 0 : undefined
   )
   const shouldAutoPlay = useCallback(
      (index: number) => {
         return expandedPlayingIndex === undefined && index === autoPlayingIndex
      },
      [expandedPlayingIndex, autoPlayingIndex]
   )

   useEffect(() => {
      if (!isLiveStreamDialogOpen && !isExpanded(autoPlayingIndex)) {
         const interval = setInterval(() => {
            setAutoPlayingIndex((prevIndex) => {
               return (prevIndex + 1) % (highlights?.length || 1)
            })
         }, SPARK_CONSTANTS.SECONDS_TO_AUTO_PLAY)
         return () => clearInterval(interval)
      }
   }, [
      highlights?.length,
      isExpanded,
      isLiveStreamDialogOpen,
      autoPlayingIndex,
      setAutoPlayingIndex,
   ])

   return {
      shouldAutoPlay,
      autoPlayingIndex,
      setAutoPlayingIndex,
   }
}
