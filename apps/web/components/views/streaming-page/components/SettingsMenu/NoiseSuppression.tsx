import { Stack, Switch, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { useLocalTracks } from "../../context"

const styles = sxStyles({
   label: {
      color: "neutral.900",
   },
   description: {
      color: "neutral.400",
      maxWidth: "90%",
   },
})

export const NoiseSuppression = () => {
   const { noiseSuppressionEnabled, toggleNoiseSuppression } = useLocalTracks()

   return (
      <Stack
         direction="row"
         alignItems="center"
         pt={0.5}
         justifyContent="space-between"
      >
         <span>
            <Typography variant="body2" sx={styles.label}>
               Noise suppression
            </Typography>
            <Typography variant="xsmall" sx={styles.description}>
               Reduces background noise to improve audio clarity during
               streaming
            </Typography>
         </span>
         <Switch
            checked={noiseSuppressionEnabled}
            onChange={toggleNoiseSuppression}
            color="primary"
         />
      </Stack>
   )
}
