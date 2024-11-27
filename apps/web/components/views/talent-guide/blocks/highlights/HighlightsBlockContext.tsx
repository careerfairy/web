import useIsMobile from "components/custom-hook/useIsMobile"
import {
   ReactNode,
   createContext,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react"

type HighlightsContextType = {
   autoPlayingIndex: number
   expandedPlayingIndex: number | undefined
   shouldAutoPlay: (index: number) => boolean
   isExpanded: (index: number) => boolean
   handleExpandCardClick: (index: number) => () => void
   handleCloseCardClick: () => void
   handleEndedPlaying: () => void
   setAutoPlayingIndex: (index: number) => void
}

const HighlightsContext = createContext<HighlightsContextType | undefined>(
   undefined
)

export const HighlightsProvider = ({
   children,
   totalHighlights,
}: {
   children: ReactNode
   totalHighlights: number
}) => {
   const isMobile = useIsMobile()

   const [autoPlayingIndex, setAutoPlayingIndex] = useState<number>(
      isMobile ? 0 : undefined
   )
   const [expandedPlayingIndex, setExpandedPlayingIndex] =
      useState<number>(undefined)

   const shouldAutoPlay = useCallback(
      (index: number) => {
         return expandedPlayingIndex === undefined && index === autoPlayingIndex
      },
      [expandedPlayingIndex, autoPlayingIndex]
   )

   const isExpanded = useCallback(
      (index: number) => {
         return expandedPlayingIndex === index
      },
      [expandedPlayingIndex]
   )

   const handleExpandCardClick = useCallback((index: number) => {
      return () => {
         setExpandedPlayingIndex(index)
      }
   }, [])

   const handleCloseCardClick = useCallback(() => {
      setExpandedPlayingIndex(undefined)
   }, [])

   const handleEndedPlaying = useCallback(() => {
      if (!isMobile) return

      setAutoPlayingIndex((prevIndex) => {
         return (prevIndex + 1) % totalHighlights
      })
   }, [isMobile, totalHighlights])

   const contextValue = useMemo(
      () => ({
         autoPlayingIndex,
         expandedPlayingIndex,
         shouldAutoPlay,
         isExpanded,
         handleExpandCardClick,
         handleCloseCardClick,
         handleEndedPlaying,
         setAutoPlayingIndex,
      }),
      [
         autoPlayingIndex,
         expandedPlayingIndex,
         shouldAutoPlay,
         isExpanded,
         handleExpandCardClick,
         handleCloseCardClick,
         handleEndedPlaying,
         setAutoPlayingIndex,
      ]
   )

   return (
      <HighlightsContext.Provider value={contextValue}>
         {children}
      </HighlightsContext.Provider>
   )
}

export const useHighlights = () => {
   const context = useContext(HighlightsContext)
   if (context === undefined) {
      throw new Error("useHighlights must be used within a HighlightsProvider")
   }
   return context
}
