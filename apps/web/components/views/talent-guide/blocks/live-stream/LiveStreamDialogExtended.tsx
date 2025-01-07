import { Box } from "@mui/material"
import useLivestream from "components/custom-hook/live-stream/useLivestream"
import LivestreamDialog from "components/views/livestream-dialog/LivestreamDialog"
import { useRouter } from "next/router"
import { SyntheticEvent, useCallback, useEffect } from "react"

type Props = {
   isLiveStreamDialogOpen: boolean
   handleLiveStreamDialogClose: () => void
   currentLiveStreamIdInDialog: string
   getLiveStreamDialogKey: () => string
}

const Dialog = ({
   isLiveStreamDialogOpen,
   handleLiveStreamDialogClose,
   currentLiveStreamIdInDialog,
   getLiveStreamDialogKey,
}: Props) => {
   const router = useRouter()
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
      <Box onClick={handleDialogClick}>
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

export const LiveStreamDialogExtended = ({
   currentLiveStreamIdInDialog,
   ...props
}: Props) => {
   // So we don't run into runtime errors when trying
   // to fetch data of an undefined live stream id
   if (!currentLiveStreamIdInDialog) return null

   return (
      <Dialog
         currentLiveStreamIdInDialog={currentLiveStreamIdInDialog}
         {...props}
      />
   )
}
