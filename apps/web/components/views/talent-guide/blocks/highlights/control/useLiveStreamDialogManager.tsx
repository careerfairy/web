import { useRouter } from "next/router"
import { useCallback, useEffect } from "react"
import {
   LiveStreamDialogContextType,
   useLiveStreamDialog,
} from "../../live-stream/LiveStreamDialogContext"
import { HighlightsContextType } from "./HighlightsBlockContext"

export const useLiveStreamDialogManager = (
   setExpandedPlayingIndex: HighlightsContextType["setExpandedPlayingIndex"]
): {
   handleLiveStreamDialogOpen: LiveStreamDialogContextType["handleLiveStreamDialogOpen"]
   handleLiveStreamDialogClose: LiveStreamDialogContextType["handleLiveStreamDialogClose"]
   handleCloseCardClick: HighlightsContextType["handleCloseCardClick"]
   isLiveStreamDialogOpen: LiveStreamDialogContextType["isLiveStreamDialogOpen"]
   currentLiveStreamIdInDialog: LiveStreamDialogContextType["currentLiveStreamIdInDialog"]
   setCurrentLiveStreamIdInDialog: LiveStreamDialogContextType["setCurrentLiveStreamIdInDialog"]
   getLiveStreamDialogKey: LiveStreamDialogContextType["getLiveStreamDialogKey"]
} => {
   const router = useRouter()

   const {
      currentLiveStreamIdInDialog,
      setCurrentLiveStreamIdInDialog,
      handleLiveStreamDialogOpen,
      handleLiveStreamDialogClose,
      getLiveStreamDialogKey,
      isLiveStreamDialogOpen,
   } = useLiveStreamDialog()

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
