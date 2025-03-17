import { Box, Stack, Typography } from "@mui/material"
import { VideoEffectsButtons } from "../VideoEffectsButtons"

export const VideoEffects = () => {
   return (
      <Stack spacing={1}>
         <Typography variant="small" color="neutral.800">
            Video background
         </Typography>
         <Box>
            <VideoEffectsButtons />
         </Box>
      </Stack>
   )
}
