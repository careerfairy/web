import { Grid } from "@mui/material"
import React from "react"
import { BlurIcon, PlaceholderImageIcon } from "components/views/common/icons"
import { Slash } from "react-feather"
import { BackgroundModeButton } from "./BackgroundModeButton"

export const VideoEffectsButtons = () => {
   return (
      <Grid container spacing={1.5}>
         <Grid item xs={4}>
            <BackgroundModeButton label="No Effect" icon={<Slash />} />
         </Grid>
         <Grid item xs={4}>
            <BackgroundModeButton
               label="Background Blur"
               active
               icon={<BlurIcon />}
            />
         </Grid>
         <Grid item xs={4}>
            <BackgroundModeButton
               label="Custom Image"
               icon={<PlaceholderImageIcon />}
            />
         </Grid>
      </Grid>
   )
}
