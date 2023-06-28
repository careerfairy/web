import { Box, Button } from "@mui/material"
import { sxStyles } from "../../../types/commonTypes"
import useIsMobile from "../../custom-hook/useIsMobile"
import {
   ONBOARDING_VIDEO_URL_DESKTOP,
   ONBOARDING_VIDEO_URL_MOBILE,
} from "../../util/constants"
import { useCallback } from "react"
import ReactPlayer from "react-player"

const styles = sxStyles({
   container: {
      backgroundColor: "#FCFCFC",
      padding: 1,
      borderRadius: 5,
   },
   videoContainer: {
      "& video": {
         borderRadius: 5,
      },
   },
   button: {
      boxShadow: "none",
      padding: "0px 15px",
      textTransform: "none",
   },
})

export const VideoView = ({ onComplete }: { onComplete: () => void }) => {
   const isMobile = useIsMobile()

   const videoUrl = isMobile
      ? ONBOARDING_VIDEO_URL_MOBILE
      : ONBOARDING_VIDEO_URL_DESKTOP

   const onEnded = useCallback(() => {
      onComplete()
   }, [onComplete])

   return (
      <Box sx={styles.container}>
         <Box textAlign="center" sx={styles.videoContainer}>
            <ReactPlayer
               width="100%"
               height="100%"
               playsinline
               controls
               url={videoUrl}
               config={videoConfig}
               playing={true}
               onEnded={onEnded}
            />
         </Box>
         <Box textAlign={isMobile ? "center" : "right"}>
            <Button
               size="small"
               sx={styles.button}
               variant="contained"
               color="primary"
               onClick={onEnded}
            >
               Skip video
            </Button>
         </Box>
      </Box>
   )
}

const videoConfig = {
   file: {
      attributes: {
         controlsList: "nodownload noplaybackrate",
         disablePictureInPicture: true,
         playsInline: true,
      },
   },
}

export default VideoView
