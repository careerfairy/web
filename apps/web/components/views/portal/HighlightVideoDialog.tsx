import React from "react"
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
const Content = ({ videoUrl, onClose }: ContentProps) => {
   const [video, _, controls] = useVideo(
      <Box
         sx={styles.video}
         component="video"
         controls
         src={videoUrl}
         autoPlay
      />
   )

   return <>{video}</>
}
const HighlightVideoDialog = ({
   videoUrl,
   handleClose,
}: HighlightVideoDialogProps) => {
   const onClose = () => {
      handleClose()
   }
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
         <Content onClose={onClose} videoUrl={videoUrl} />
      </Dialog>
   )
}
interface HighlightVideoDialogProps {
   videoUrl?: string
   handleClose: () => void
}
interface ContentProps {
   videoUrl: string
   onClose: () => void
}

export default HighlightVideoDialog
