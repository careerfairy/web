import { Stack, Switch, Typography } from "@mui/material"

export const NoiseSuppression = () => {
   // const {
   // noiseSuppressionEnabled,
   // toggleNoiseSuppression,
   // isNoiseSuppressionSupported,
   // } = useLocalTracks()

   // if (!isNoiseSuppressionSupported) return null

   return (
      <Stack
         direction="row"
         alignItems="center"
         pt={1}
         justifyContent="space-between"
      >
         <span>
            <Typography variant="small" color="neutral.800">
               Noise suppression
            </Typography>
            <Typography variant="xsmall" component="p" color="neutral.400">
               Reduces background noise to improve audio clarity during
               streaming
            </Typography>
         </span>
         <Switch
            // checked={noiseSuppressionEnabled}
            // onChange={toggleNoiseSuppression}
            color="primary"
         />
      </Stack>
   )
}
