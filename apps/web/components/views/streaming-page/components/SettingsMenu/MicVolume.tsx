import { Box, Stack, Typography } from "@mui/material"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { useAudioTrackVolumeLevel } from "components/custom-hook/streaming/useAudioTrackVolumeLevel"
import { useMemo } from "react"
import { sxStyles } from "types/commonTypes"
import { useLocalTracks } from "../../context"

const styles = sxStyles({
   indicator: {
      borderRadius: "50%",
      width: 14,
      height: 14,
      backgroundColor: (theme) => theme.brand.black[500],
      transition: "background-color 0.2s",
   },
   indicatorActive: {
      backgroundColor: "primary.main",
   },
})

export const MicVolume = () => {
   const { localMicrophoneTrack } = useLocalTracks()

   const decreaseNumberOfIndicators = useStreamIsMobile(450)

   const numberOfIndicators = decreaseNumberOfIndicators ? 18 : 23

   const volumeLevel = useAudioTrackVolumeLevel(
      localMicrophoneTrack.localMicrophoneTrack,
      250
   )

   const volumeValue = Math.floor(volumeLevel * numberOfIndicators)

   const dots = useMemo(
      () =>
         Array.from({ length: numberOfIndicators }, (_, index) => (
            <Box
               key={index}
               sx={[
                  styles.indicator,
                  index < volumeValue && styles.indicatorActive,
               ]}
            />
         )),
      [volumeValue, numberOfIndicators]
   )

   return (
      <Stack spacing={1.5}>
         <Typography color="neutral.800" variant="small">
            Input level
         </Typography>
         <Stack maxWidth={571} direction="row" justifyContent="space-around">
            {dots}
         </Stack>
      </Stack>
   )
}
