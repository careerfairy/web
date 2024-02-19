import { Box, Stack, Typography } from "@mui/material"
import { useVolumeLevel } from "agora-rtc-react"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { sxStyles } from "types/commonTypes"
import { useSettingsMenu } from "./SettingsMenuContext"

const styles = sxStyles({
   volumeLabel: {
      color: "neutral.400",
   },
})

export const MicVolume = () => {
   const { tempMicrophoneTrack } = useSettingsMenu()

   const decreaseNumberOfIndicators = useStreamIsMobile(450)

   const numberOfIndicators = decreaseNumberOfIndicators ? 18 : 23

   const volumeLevel =
      useVolumeLevel(tempMicrophoneTrack.localMicrophoneTrack) || 0
   const volumeValue = Math.floor(volumeLevel * numberOfIndicators)

   const dots = Array.from({ length: numberOfIndicators }, (_, index) => (
      <Box
         key={index}
         sx={{
            borderRadius: "50%",
            width: 14,
            height: 14,
            backgroundColor: (theme) =>
               index < volumeValue ? "primary.main" : theme.brand.black[500],
         }}
      />
   ))

   return (
      <Stack spacing={1.5}>
         <Typography sx={styles.volumeLabel} variant="small">
            Input level
         </Typography>
         <Stack maxWidth={571} direction="row" justifyContent="space-around">
            {dots}
         </Stack>
      </Stack>
   )
}
