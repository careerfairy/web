import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Box } from "@mui/material"
import LivestreamDialog from "components/views/livestream-dialog/LivestreamDialog"
import { useRouter } from "next/router"
import { SyntheticEvent, useCallback, useEffect } from "react"
import { useHighlights } from "./HighlightsBlockContext"

export const LiveStreamDialogExtended = ({
   livestream,
}: {
   livestream: LivestreamEvent
}) => {
   const router = useRouter()

   const { isLiveStreamDialogOpen, handleLiveStreamDialogClose } =
      useHighlights()

   // Prevents exiting the fullscreen view when interacting with the dialog
   const handleDialogClick = useCallback((event: SyntheticEvent) => {
      event.stopPropagation()
      event.preventDefault()
   }, [])

   const handleLiveStreamDialogCloseExtended = useCallback(() => {
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
      handleLiveStreamDialogClose()
   }, [handleLiveStreamDialogClose, router])

   useEffect(() => {
      if (!router.query.livestreamId && isLiveStreamDialogOpen) {
         handleLiveStreamDialogClose()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [router.query.livestreamId])

   return (
      <Box onClick={handleDialogClick}>
         <LivestreamDialog
            open={isLiveStreamDialogOpen}
            livestreamId={livestream.id}
            serverSideLivestream={livestream}
            handleClose={handleLiveStreamDialogCloseExtended}
            page={"details"}
            mode="stand-alone"
            serverUserEmail={""}
         />
      </Box>
   )
}
