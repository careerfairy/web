import { Box, Button, Stack } from "@mui/material"
import { sxStyles } from "../../../types/commonTypes"
import { useVideo } from "react-use"
import useIsMobile from "../../custom-hook/useIsMobile"
import {
   ONBOARDING_VIDEO_URL_DESKTOP,
   ONBOARDING_VIDEO_URL_MOBILE,
} from "../../util/constants"
import { useCallback } from "react"

const styles = sxStyles({
   video: {
      width: "100%",
      borderRadius: 2,
   },

   videoMobile: {
      width: "90%",
   },

   button: {
      boxShadow: "none",
      padding: "5px 15px",
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

   const [video] = useVideo(
      <Box
         sx={[styles.video, isMobile && styles.videoMobile]}
         webkit-playsInline
         // @ts-ignore
         webkitPlaysInline
         playsInline
         component="video"
         controls
         disablePictureInPicture={true}
         src={videoUrl}
         onEnded={onEnded}
         controlsList="nodownload"
      />
   )

   return (
      <Box>
         <Box textAlign="center">{video}</Box>
         <Box textAlign={isMobile ? "center" : "right"} pb={1}>
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

export default VideoView
