import { Box, Stack, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { VideoEffectsButtons } from "../VideoEffectsButtons"

const styles = sxStyles({
   subHeading: {
      color: "neutral.400",
   },
})

export const VideoEffects = () => {
   return (
      <Stack spacing={1}>
         <Typography sx={styles.subHeading} variant="small">
            Video background
         </Typography>
         <Box>
            <VideoEffectsButtons />
         </Box>
      </Stack>
   )
}
