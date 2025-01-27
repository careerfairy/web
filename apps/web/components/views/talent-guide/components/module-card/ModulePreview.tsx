import {
   Box,
   Button,
   Collapse,
   IconButton,
   Stack,
   Typography,
} from "@mui/material"
import FramerBox from "components/views/common/FramerBox"
import { MotionProps } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import { ArrowRight, Minus, Plus, Volume2, VolumeX, X } from "react-feather"
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
      backgroundColor: "rgba(31, 31, 35, 0.50)",
      p: 1.5,
      color: "white",
      "&:hover, &:focus": {
         backgroundColor: "rgba(31, 31, 35, 0.70)",
      },
   },
   bottomContent: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 1.5,
      background: "rgba(252, 252, 254, 0.85)",
      color: "neutral.800",
      borderRadius: "12px",
      m: 2.5,
      backdropFilter: "blur(40px)",
      border: "1px solid rgba(255, 255, 255, 0.30)",
   },
   toggleDescriptionButton: {
      p: 1,
      m: -1,
      "& svg": {
         strokeWidth: 3,
      },
   },
   descriptionCollapse: {
      mb: 1.5,
   },
})

type Props = {
   thumbnailUrl: string
   videoUrl: string
   onClose?: () => void
}

const checkIsMuted = () => {
   if ("userActivation" in navigator) {
      return !navigator.userActivation.hasBeenActive
   }
   return false
}

export const ModulePreview = ({ thumbnailUrl, videoUrl, onClose }: Props) => {
   const [isMuted, setIsMuted] = useState(checkIsMuted())

   const [showDescription, setShowDescription] = useState(true)

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

         <FramerBox
            sx={styles.bottomContent}
            component={Stack}
            {...bottomContentAnimation}
         >
            <Stack
               direction="row"
               alignItems="start"
               justifyContent="space-between"
            >
               <Typography variant="brandedH5" mb={0.5} fontWeight={700}>
                  {module.content.moduleName}
               </Typography>
               <IconButton
                  sx={styles.toggleDescriptionButton}
                  aria-label="Toggle description"
                  disableRipple
                  onClick={() => setShowDescription(!showDescription)}
               >
                  {showDescription ? <Minus size={20} /> : <Plus size={20} />}
               </IconButton>
            </Stack>
            <Collapse sx={styles.descriptionCollapse} in={showDescription}>
               <Typography variant="small">
                  {module.content.moduleDescription}
               </Typography>
            </Collapse>
            <Button
               component={Link}
               href={`/levels/${module.slug}`}
               variant="contained"
               color="primary"
               size="large"
               endIcon={<ArrowRight size={20} />}
            >
               Start Level
            </Button>
         </FramerBox>
      </Box>
   )
}

const bottomContentAnimation = {
   initial: { y: 100, opacity: 0 },
   animate: { y: 0, opacity: 1 },
   transition: {
      type: "spring",
      damping: 30,
      stiffness: 200,
      delay: 0.2,
   },
} satisfies MotionProps
