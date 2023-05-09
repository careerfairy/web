import { FC } from "react"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import useLivestream from "../../custom-hook/live-stream/useLivestream"
import { Dialog, DialogContent, Slide } from "@mui/material"
import useIsMobile from "../../custom-hook/useIsMobile"

type Props = {
   serverSideLivestream: LivestreamEvent
   handleClose: () => void
   open: boolean
}

const LivestreamDialog: FC<Props> = ({
   handleClose,
   open,
   serverSideLivestream,
}) => {
   const isMobile = useIsMobile()

   const { data: livestream } = useLivestream(
      serverSideLivestream.id,
      serverSideLivestream
   )

   const onClose = () => {
      handleClose()
   }

   return (
      <Dialog
         open={open}
         onClose={onClose}
         TransitionComponent={Slide}
         maxWidth="lg"
         fullWidth
         fullScreen={isMobile}
      >
         <DialogContent>{livestream.title}</DialogContent>
      </Dialog>
   )
}

export default LivestreamDialog
