import { Box } from "@mui/material"
import useLivestream from "components/custom-hook/live-stream/useLivestream"
import LivestreamDialog from "components/views/livestream-dialog/LivestreamDialog"
import { useRouter } from "next/router"
import { SyntheticEvent, useCallback, useEffect } from "react"
import { useHighlights } from "./control/HighlightsBlockContext"

const Dialog = () => {
   const router = useRouter()

   const {
      isLiveStreamDialogOpen,
      handleLiveStreamDialogClose,
      currentLiveStreamIdInDialog,
   } = useHighlights()

   const { data: livestream } = useLivestream(currentLiveStreamIdInDialog)

   // Prevents exiting the fullscreen view when interacting with the dialog
   const handleDialogClick = useCallback((event: SyntheticEvent) => {
      event.stopPropagation()
      event.preventDefault()
   }, [])

   useEffect(() => {
      if (!router.query.livestreamId && isLiveStreamDialogOpen) {
         handleLiveStreamDialogClose()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [router.query.livestreamId])

   if (!livestream) return null

   return (
      <Box onClick={handleDialogClick} key={currentLiveStreamIdInDialog}>
         <LivestreamDialog
            open={isLiveStreamDialogOpen}
            livestreamId={livestream.id}
            serverSideLivestream={livestream}
            handleClose={handleLiveStreamDialogClose}
            page={"details"}
            mode="stand-alone"
            serverUserEmail={""}
         />
      </Box>
   )
}

export const LiveStreamDialogExtended = () => {
   const { currentLiveStreamIdInDialog } = useHighlights()

   // So we don't run into runtime errors when trying
   // to fetch data of an undefined live stream id
   if (!currentLiveStreamIdInDialog) return null

   return <Dialog />
}
