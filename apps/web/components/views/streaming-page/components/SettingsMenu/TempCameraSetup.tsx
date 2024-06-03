import { Box, Button } from "@mui/material"
import { Video } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useLocalTracks } from "../../context"
import { useMediaStream } from "./useMediaStream"

const styles = sxStyles({
   video: {
      aspectRatio: "16/9",
      width: "100%",
      borderRadius: "8px",
      border: (theme) => `1px solid ${theme.brand.purple[100]}`,
      "& .videoTrack": {
         "& > div": {
            backgroundColor: (theme) => theme.brand.white[300] + " !important",
         },
      },
   },
   centered: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
})

export const TempCameraSetup = () => {
   const tempVideoStreamRef = useMediaStream()
   const { cameraOn } = useLocalTracks()

   if (!cameraOn) return <TurnOnCameraButton />

   return (
      <Box
         component="video"
         width="100%"
         height="100%"
         sx={styles.video}
         ref={tempVideoStreamRef}
         muted
         autoPlay
      />
   )
}

export const TurnOnCameraButton = () => {
   const { toggleCamera } = useLocalTracks()
   return (
      <Box sx={[styles.video, styles.centered]}>
         <Button
            variant="contained"
            onClick={toggleCamera}
            startIcon={<Video />}
         >
            Turn on camera
         </Button>
      </Box>
   )
}
