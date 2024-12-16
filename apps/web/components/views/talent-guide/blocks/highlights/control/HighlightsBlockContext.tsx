import { HighlightsBlockType } from "data/hygraph/types"
import {
   Dispatch,
   ReactNode,
   SetStateAction,
   createContext,
   useContext,
   useMemo,
} from "react"
import { useAutoPlayManager } from "./useAutoPlayManager"
import { useExpandManager } from "./useExpandManager"
import { useLiveStreamDialogManager } from "./useLiveStreamDialogManager"

export type HighlightsContextType = {
   highlights: HighlightsBlockType["highlights"]
   autoPlayingIndex: number
   expandedPlayingIndex: number | undefined
   shouldAutoPlay: (index: number) => boolean
   isExpanded: (index: number) => boolean
   handleExpandCardClick: (index: number) => () => void
   handleCloseCardClick: () => void
   setAutoPlayingIndex: Dispatch<SetStateAction<number>>
   isLiveStreamDialogOpen: boolean
   handleLiveStreamDialogOpen: (liveStreamId: string) => void
   handleLiveStreamDialogClose: () => void
   isPlayingExpanded: boolean
   toggleExpandedPlaying: () => void
   currentLiveStreamIdInDialog: string
   setCurrentLiveStreamIdInDialog: (id: string) => void
   setExpandedPlayingIndex: (index: number) => void
}

const HighlightsContext = createContext<HighlightsContextType | undefined>(
   undefined
)

type HighlightsProviderProps = {
   children: ReactNode
   highlights: HighlightsBlockType["highlights"]
}

export const HighlightsProvider = ({
   children,
   highlights,
}: HighlightsProviderProps) => {
   const {
      isExpanded,
      isPlayingExpanded,
      toggleExpandedPlaying,
      handleExpandCardClick,
      setExpandedPlayingIndex,
      expandedPlayingIndex,
   } = useExpandManager(highlights)

   const {
      isLiveStreamDialogOpen,
      handleLiveStreamDialogOpen,
      handleLiveStreamDialogClose,
      handleCloseCardClick,
      currentLiveStreamIdInDialog,
      setCurrentLiveStreamIdInDialog,
   } = useLiveStreamDialogManager(
      highlights,
      expandedPlayingIndex,
      setExpandedPlayingIndex
   )

   const { shouldAutoPlay, autoPlayingIndex, setAutoPlayingIndex } =
      useAutoPlayManager(
         highlights,
         expandedPlayingIndex,
         isLiveStreamDialogOpen,
         isExpanded
      )

   const contextValue = useMemo(
      () => ({
         highlights,
         autoPlayingIndex,
         expandedPlayingIndex,
         setExpandedPlayingIndex,
         shouldAutoPlay,
         isExpanded,
         handleExpandCardClick,
         handleCloseCardClick,
         setAutoPlayingIndex,
         isLiveStreamDialogOpen,
         handleLiveStreamDialogOpen,
         handleLiveStreamDialogClose,
         isPlayingExpanded,
         toggleExpandedPlaying,
         currentLiveStreamIdInDialog,
         setCurrentLiveStreamIdInDialog,
      }),
      [
         highlights,
         autoPlayingIndex,
         expandedPlayingIndex,
         setExpandedPlayingIndex,
         shouldAutoPlay,
         isExpanded,
         handleExpandCardClick,
         handleCloseCardClick,
         setAutoPlayingIndex,
         isLiveStreamDialogOpen,
         handleLiveStreamDialogOpen,
         handleLiveStreamDialogClose,
         isPlayingExpanded,
         toggleExpandedPlaying,
         currentLiveStreamIdInDialog,
         setCurrentLiveStreamIdInDialog,
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
      console.error("useHighlights must be used within a HighlightsProvider")
   }
   return context
}
