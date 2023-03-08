import { Box, Typography } from "@mui/material"
import { Fragment } from "react"
import { useSoundMeter } from "../../custom-hook/useSoundMeter"

const styles = {
   rect: {
      display: "inline-block",
      margin: "0 10px 0 0",
      height: 10,
      width: 10,
      borderRadius: "50%",
      backgroundColor: "#eaeaea",
   },
   button: {
      height: "100%",
   },
}

function SoundLevelDisplay({ localStream, showSoundMeter }) {
   const baseGreen = "#00d2aa"
   const audioLevel = useSoundMeter(
      showSoundMeter,
      localStream?.audioTrack?.getMediaStreamTrack()
   )

   const isGreen = (threshold) => {
      return audioLevel > threshold
   }

   return (
      <Fragment>
         <Box>
            <Typography
               style={{ fontSize: "0.8rem", marginBottom: 10, marginTop: 10 }}
            >
               Talk to ensure that sound is being detected
            </Typography>
         </Box>
         <Box style={{ display: "inline-block", margin: "0 auto" }}>
            <Box
               sx={styles.rect}
               style={
                  isGreen(0) ? { opacity: 1, backgroundColor: baseGreen } : null
               }
            />
            <Box
               sx={styles.rect}
               style={
                  isGreen(0.01)
                     ? { opacity: 0.95, backgroundColor: baseGreen }
                     : null
               }
            />
            <Box
               sx={styles.rect}
               style={
                  isGreen(0.025)
                     ? { opacity: 0.9, backgroundColor: baseGreen }
                     : null
               }
            />
            <Box
               sx={styles.rect}
               style={
                  isGreen(0.05)
                     ? { opacity: 0.85, backgroundColor: baseGreen }
                     : null
               }
            />
            <Box
               sx={styles.rect}
               style={
                  isGreen(0.075)
                     ? { opacity: 0.8, backgroundColor: baseGreen }
                     : null
               }
            />
            <Box
               sx={styles.rect}
               style={
                  isGreen(0.1)
                     ? { opacity: 0.75, backgroundColor: baseGreen }
                     : null
               }
            />
            <Box
               sx={styles.rect}
               style={
                  isGreen(0.15)
                     ? { opacity: 0.7, backgroundColor: baseGreen }
                     : null
               }
            />
            <Box
               sx={styles.rect}
               style={
                  isGreen(0.2)
                     ? { opacity: 0.65, backgroundColor: baseGreen }
                     : null
               }
            />
            <Box
               sx={styles.rect}
               style={
                  isGreen(0.3)
                     ? { opacity: 0.6, backgroundColor: baseGreen }
                     : null
               }
            />
            <Box
               sx={styles.rect}
               style={
                  isGreen(0.4)
                     ? { opacity: 0.55, backgroundColor: baseGreen }
                     : null
               }
            />
            <Box
               sx={styles.rect}
               style={
                  isGreen(0.5)
                     ? { opacity: 0.5, backgroundColor: baseGreen }
                     : null
               }
            />
            <Box
               sx={styles.rect}
               style={
                  isGreen(0.7)
                     ? { opacity: 0.45, backgroundColor: baseGreen }
                     : null
               }
            />
         </Box>
      </Fragment>
   )
}

export default SoundLevelDisplay
