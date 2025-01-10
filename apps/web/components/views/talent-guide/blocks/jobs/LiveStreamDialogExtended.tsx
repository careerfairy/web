import { Box } from "@mui/material"
import useLivestream from "components/custom-hook/live-stream/useLivestream"
import LivestreamDialog from "components/views/livestream-dialog/LivestreamDialog"
import { useRouter } from "next/router"
import { SyntheticEvent, useCallback, useEffect } from "react"
import { useJobsBlock } from "./control/JobsBlockContext"

const Dialog = () => {
   const router = useRouter()

   const {
      isLiveStreamDialogOpen,
      handleLiveStreamDialogClose,
      currentLiveStreamIdInDialog,
      getLiveStreamDialogKey,
   } = useJobsBlock()

   const { data: livestream } = useLivestream(currentLiveStreamIdInDialog)

   // Prevents exiting the fullscreen view when interacting with the dialog
   const handleDialogClick = useCallback((event: SyntheticEvent) => {
      event.stopPropagation()
      event.preventDefault()
   }, [])

   useEffect(() => {
      if (!router.query.dialogLiveStreamId && isLiveStreamDialogOpen) {
         handleLiveStreamDialogClose()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [router.query.dialogLiveStreamId])

   if (!livestream) return null

   return (
      <Box onClick={handleDialogClick} key={currentLiveStreamIdInDialog}>
         <LivestreamDialog
            key={getLiveStreamDialogKey()}
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
   const { currentLiveStreamIdInDialog } = useJobsBlock()

   // So we don't run into runtime errors when trying
   // to fetch data of an undefined live stream id
   if (!currentLiveStreamIdInDialog) return null

   return <Dialog />
}
