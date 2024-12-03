import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import useIsMobile from "components/custom-hook/useIsMobile"
import { HighlightsBlockType } from "data/hygraph/types"
import { useRouter } from "next/router"
import {
   ReactNode,
   createContext,
   useCallback,
   useContext,
   useEffect,
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
   isLiveStreamDialogOpen: boolean
   handleLiveStreamDialogOpen: () => void
   handleLiveStreamDialogClose: () => void
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
   const router = useRouter()
   const isMobile = useIsMobile()

   const [autoPlayingIndex, setAutoPlayingIndex] = useState<number>(
      isMobile ? 0 : undefined
   )
   const [expandedPlayingIndex, setExpandedPlayingIndex] =
      useState<number>(undefined)

   const [
      isLiveStreamDialogOpen,
      handleLiveStreamDialogOpen,
      handleLiveStreamDialogClose,
   ] = useDialogStateHandler()

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

   const handleCloseCardClick = useCallback(() => {
      setExpandedPlayingIndex(undefined)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { highlightId, ...restOfQuery } = router.query
      void router.push(
         {
            pathname: router.pathname,
            query: restOfQuery,
         },
         undefined,
         {
            scroll: false,
            shallow: true,
         }
      )
   }, [router])

   const handleEndedPlaying = useCallback(() => {
      if (!isMobile) return

      setAutoPlayingIndex((prevIndex) => {
         return (prevIndex + 1) % highlights.length
      })
   }, [isMobile, highlights])

   useEffect(() => {
      if (!router.query.highlightId) {
         setExpandedPlayingIndex(undefined)
      }
   }, [router.query.highlightId])

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
         isLiveStreamDialogOpen,
         handleLiveStreamDialogOpen,
         handleLiveStreamDialogClose,
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
         isLiveStreamDialogOpen,
         handleLiveStreamDialogOpen,
         handleLiveStreamDialogClose,
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
