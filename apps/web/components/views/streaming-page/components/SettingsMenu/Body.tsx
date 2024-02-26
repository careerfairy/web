import { Box, DialogContent, Stack, Typography } from "@mui/material"
import React from "react"
import { MicVolume } from "./MicVolume"
import { TempCameraSetup } from "./TempCameraSetup"
import { TempCameraSelect, TempMicrophoneSelect } from "./temp-device-select"
import { VideoEffects } from "./VideoEffects"
import { sxStyles } from "types/commonTypes"

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
            </Box>
            <Box>
               <MenuHeading>Video settings</MenuHeading>
               <Box pb={2} />
               <TempCameraSetup />
               <Box pb={1.5} />
               <TempCameraSelect />
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
