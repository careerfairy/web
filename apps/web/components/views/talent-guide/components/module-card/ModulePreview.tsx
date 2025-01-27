import { Box, IconButton, Stack, Typography } from "@mui/material"
import { useState } from "react"
import { Volume2, VolumeX, X } from "react-feather"
import ReactPlayer from "react-player/file"
import { sxStyles } from "types/commonTypes"
import { useModuleCardContext } from "./ModuleCard"

const styles = sxStyles({
   videoContainer: {
      width: "100% !important",
      height: "100% !important",
      position: "relative",
      "& .react-player": {
         width: "100% !important",
         height: "100% !important",
         "& video": {
            objectFit: "cover",
         },
      },
   },
   controls: {
      position: "absolute",
      top: 16,
      right: 16,
      display: "flex",
      gap: 1,
      zIndex: 1,
   },
   iconButton: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      color: "white",
      "&:hover": {
         backgroundColor: "rgba(0, 0, 0, 0.7)",
      },
   },
   bottomContent: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 3,
      background: "linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)",
      color: "white",
   },
   startButton: {
      backgroundColor: (theme) => theme.palette.primary[500],
      color: "white",
      padding: "12px 24px",
      borderRadius: "100px",
      textAlign: "center",
      cursor: "pointer",
      transition: "background-color 0.2s",
      "&:hover": {
         backgroundColor: (theme) => theme.palette.primary[600],
      },
   },
})

type Props = {
   thumbnailUrl: string
   videoUrl: string
   onClose?: () => void
}

export const ModulePreview = ({ thumbnailUrl, videoUrl, onClose }: Props) => {
   const [isMuted, setIsMuted] = useState(
      "userActivation" in navigator
         ? !navigator.userActivation.hasBeenActive
         : false
   )
   const { module } = useModuleCardContext()

   const toggleMute = () => setIsMuted(!isMuted)

   return (
      <Box sx={styles.videoContainer}>
         <Box sx={styles.controls}>
            <IconButton
               sx={styles.iconButton}
               onClick={toggleMute}
               size="small"
            >
               {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </IconButton>
            <IconButton sx={styles.iconButton} onClick={onClose} size="small">
               <X size={20} />
            </IconButton>
         </Box>

         <ReactPlayer
            className="react-player"
            width="100%"
            height="100%"
            playsinline
            controls={false}
            muted={isMuted}
            url={videoUrl}
            config={{
               attributes: {
                  poster: thumbnailUrl,
               },
            }}
            loop
            playing
         />

         <Stack spacing={2} sx={styles.bottomContent}>
            <Typography variant="h5" fontWeight={600}>
               {module.content.moduleName}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
               {module.content.moduleDescription}
            </Typography>
            <Box sx={styles.startButton}>Start Level</Box>
         </Stack>
      </Box>
   )
}
