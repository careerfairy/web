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
   getLiveStreamDialogKey: () => string
} => {
   const router = useRouter()
   const isLiveStreamDialogOpen = useIsLiveStreamDialogOpen()

   const [currentLiveStreamIdInDialog, setCurrentLiveStreamIdInDialog] =
      useState<string>(undefined)

   // This is used to force a re-render of the dialog when the live stream id is the same
   // on nested live stream cards. Example: speaker details with same live stream card on
   // linked content section.
   const [liveStreamDialogKey, setLiveStreamDialogKey] =
      useState<string>(undefined)

   const handleLiveStreamDialogOpen = useCallback(
      (newLiveStreamId: string) => {
         if (currentLiveStreamIdInDialog === newLiveStreamId) {
            setLiveStreamDialogKey(
               `${currentLiveStreamIdInDialog}-${Date.now()}`
            )
         } else {
            setLiveStreamDialogKey(undefined)
         }

         void router.push(
            {
               pathname: router.pathname,
               query: {
                  ...router.query,
                  highlightId: highlights[expandedPlayingIndex].id,
                  dialogLiveStreamId: newLiveStreamId,
               },
            },
            undefined,
            {
               scroll: false,
               shallow: true,
            }
         )
      },
      [currentLiveStreamIdInDialog, expandedPlayingIndex, highlights, router]
   )

   const handleLiveStreamDialogClose = useCallback(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { dialogLiveStreamId, ...restOfQuery } = router.query
      setLiveStreamDialogKey(undefined)
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

   const getLiveStreamDialogKey = useCallback(() => {
      return liveStreamDialogKey || currentLiveStreamIdInDialog
   }, [liveStreamDialogKey, currentLiveStreamIdInDialog])

   useEffect(() => {
      const queryParamLiveStreamId = router.query.dialogLiveStreamId as string

      if (queryParamLiveStreamId) {
         if (liveStreamDialogKey === queryParamLiveStreamId) {
            setLiveStreamDialogKey(`${queryParamLiveStreamId}-${Date.now()}`)
         } else {
            setLiveStreamDialogKey(undefined)
         }
         setCurrentLiveStreamIdInDialog(queryParamLiveStreamId)
      }
   }, [
      router.query.dialogLiveStreamId,
      setCurrentLiveStreamIdInDialog,
      isLiveStreamDialogOpen,
      liveStreamDialogKey,
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
      getLiveStreamDialogKey,
   }
}
