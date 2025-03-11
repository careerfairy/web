import { Box, DialogContent, Stack, Typography } from "@mui/material"
import React from "react"
import { sxStyles } from "types/commonTypes"
import { MicVolume } from "./MicVolume"
import { NoiseSuppression } from "./NoiseSuppression"
import { TempCameraSetup } from "./TempCameraSetup"
import { VideoEffects } from "./VideoEffects"
import { TempCameraSelect, TempMicrophoneSelect } from "./temp-device-select"

const styles = sxStyles({
   dialogContent: {
      p: 2,
      border: "none",
   },
   heading: {
      fontWeight: 600,
      color: "neutral.900",
   },
})

export const Body = () => {
   return (
      <DialogContent sx={styles.dialogContent} dividers>
         <Stack spacing={3}>
            <Box>
               <MenuHeading>Voice settings</MenuHeading>
               <Box pb={2} />
               <TempMicrophoneSelect />
               <Box pb={1.5} />
               <MicVolume />
               <Box pb={1.5} />
               <NoiseSuppression />
            </Box>
            <Box>
               <MenuHeading>Video settings</MenuHeading>
               <Box pb={2} />
               <TempCameraSelect />
               <Box pb={1.5} />
               <TempCameraSetup />
               <Box pb={1.5} />
               <VideoEffects />
            </Box>
         </Stack>
      </DialogContent>
   )
}

type MenuHeadingProps = {
   children: React.ReactNode
}

const MenuHeading = ({ children }: MenuHeadingProps) => {
   return (
      <Typography variant="brandedH4" sx={styles.heading}>
         {children}
      </Typography>
   )
}
