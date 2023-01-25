import React, { useEffect } from "react"
import Dialog from "@mui/material/Dialog"
import { useVideo } from "react-use"
import Box from "@mui/material/Box"
import Slide from "@mui/material/Slide"
import CloseIcon from "@mui/icons-material/Close"
import { IconButton } from "@mui/material"
const styles = {
   video: {
      width: "100%",
      height: "100%",
      borderRadius: 2,
      boxShadow: 4,
      background: "black",
      maxHeight: "inherit",
   },
   dialogPaper: {
      borderRadius: 2,
      boxShadow: 4,
      background: "black",
      maxHeight: "calc(100vh - 64px)",
   },
   closeIconButton: {
      position: "fixed",
      top: "0.5rem",
      right: "0.5rem",
      color: "white",
   },
} as const
const HighlightVideoDialog = ({
   videoUrl,
   handleClose,
   handlePlayVideo,
   handlePauseVideo,
}: HighlightVideoDialogProps) => {
   const [video, state, controls] = useVideo(
      <Box
         sx={styles.video}
         webkit-playsInline
         // @ts-ignore
         webkitPlaysInline
         playsInline
         component="video"
         controls
         src={videoUrl}
         onPlay={handlePlayVideo}
         onPause={handlePauseVideo}
         controlsList="nodownload"
      />
   )
   const onClose = () => {
      controls.mute()
      controls.pause()
      handleClose()
   }

   useEffect(() => {
      if (state.duration) {
         controls
            .play()
            .catch((e) => console.log("-> e in play highlight vid", e))
      }
   }, [Boolean(state.duration)])

   return (
      <Dialog
         onClose={onClose}
         TransitionComponent={Slide}
         maxWidth={"lg"}
         PaperProps={{
            sx: styles.dialogPaper,
         }}
         fullWidth
         open={Boolean(videoUrl)}
      >
         <IconButton sx={styles.closeIconButton} onClick={onClose} autoFocus>
            <CloseIcon sx={{ fontSize: "2rem" }} color={"inherit"} />
         </IconButton>
         <>{video}</>
      </Dialog>
   )
}
interface HighlightVideoDialogProps {
   videoUrl?: string
   handleClose: () => void
   handlePlayVideo?: () => void
   handlePauseVideo?: () => void
}

export default HighlightVideoDialog
