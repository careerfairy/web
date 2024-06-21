import { Box, Button, Typography } from "@mui/material"
import { VideoOff } from "react-feather"
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
   buttonContainer: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: (theme) => theme.brand.white[500],
      height: "100%",
      width: "70%",
      color: "neutral.600",
   },
   icon: {
      color: "inherit",
      width: 32,
      height: 32,
   },
   text: {
      mt: 2,
      color: "inherit",
      textAlign: "center",
      mb: 0.75,
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
         <Box sx={styles.buttonContainer}>
            <Box sx={styles.icon} component={VideoOff} />
            <Typography sx={styles.text} variant="small">
               Your camera is off, <br />
               effects won&apos;t be applied
            </Typography>
            <Button size="small" variant="contained" onClick={toggleCamera}>
               Switch camera on
            </Button>
         </Box>
      </Box>
   )
}
