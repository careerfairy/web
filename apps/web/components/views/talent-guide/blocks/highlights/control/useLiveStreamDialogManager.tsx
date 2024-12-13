import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"
import { HighlightsContextType } from "./HighlightsBlockContext"
import { useIsLiveStreamDialogOpen } from "./useIsLiveStreamDialogOpen"

export const useLiveStreamDialogManager = (
   highlights: HighlightsContextType["highlights"],
   expandedPlayingIndex: HighlightsContextType["expandedPlayingIndex"],
   setExpandedPlayingIndex: HighlightsContextType["setExpandedPlayingIndex"]
): {
   handleLiveStreamDialogOpen: HighlightsContextType["handleLiveStreamDialogOpen"]
   handleLiveStreamDialogClose: HighlightsContextType["handleLiveStreamDialogClose"]
   handleCloseCardClick: HighlightsContextType["handleCloseCardClick"]
   isLiveStreamDialogOpen: HighlightsContextType["isLiveStreamDialogOpen"]
   currentLiveStreamIdInDialog: HighlightsContextType["currentLiveStreamIdInDialog"]
   setCurrentLiveStreamIdInDialog: HighlightsContextType["setCurrentLiveStreamIdInDialog"]
} => {
   const router = useRouter()
   const isLiveStreamDialogOpen = useIsLiveStreamDialogOpen()

   const [currentLiveStreamIdInDialog, setCurrentLiveStreamIdInDialog] =
      useState<string>(undefined)

   const handleLiveStreamDialogOpen = useCallback(
      (newLiveStreamId: string) => {
         void router.push(
            {
               pathname: router.pathname,
               query: {
                  ...router.query,
                  highlightId: highlights[expandedPlayingIndex].id,
                  livestreamId: newLiveStreamId,
               },
            },
            undefined,
            {
               scroll: false,
               shallow: true,
            }
         )
      },
      [expandedPlayingIndex, highlights, router]
   )

   const handleLiveStreamDialogClose = useCallback(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { livestreamId, ...restOfQuery } = router.query
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

      setCurrentLiveStreamIdInDialog(undefined)
   }, [router, setCurrentLiveStreamIdInDialog, setExpandedPlayingIndex])

   useEffect(() => {
      const queryParamLiveStreamId = router.query.livestreamId as string
      if (queryParamLiveStreamId) {
         setCurrentLiveStreamIdInDialog(queryParamLiveStreamId)
      }
   }, [
      router.query.livestreamId,
      setCurrentLiveStreamIdInDialog,
      isLiveStreamDialogOpen,
   ])

   useEffect(() => {
      if (!router.query.highlightId) {
         setExpandedPlayingIndex(undefined)
      }
   }, [router.query.highlightId, setExpandedPlayingIndex])

   return {
      handleLiveStreamDialogOpen,
      handleLiveStreamDialogClose,
      handleCloseCardClick,
      isLiveStreamDialogOpen,
      currentLiveStreamIdInDialog,
      setCurrentLiveStreamIdInDialog,
   }
}
