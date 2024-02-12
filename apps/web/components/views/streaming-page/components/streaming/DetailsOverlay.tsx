import React from "react"
import { FloatingContent } from "./VideoTrackWrapper"
import { sxStyles } from "types/commonTypes"
import { Box, Grow, Stack, Typography } from "@mui/material"
import { MicOff, Info } from "react-feather"
import { StreamerDetails } from "components/custom-hook/streaming/useStreamerDetails"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import { getStreamerDisplayName } from "../../util"

const styles = sxStyles({
   root: {
      color: "white",
      p: {
         xs: 1,
         tablet: 2,
      },
      display: "flex",
   },
   micOff: {
      color: "error.600",
   },
   displayName: {
      ...getMaxLineStyles(1),
      fontWeight: 600,
   },
   role: {
      ...getMaxLineStyles(1),
   },
})

type Props = {
   micActive: boolean
   streamerDetails: StreamerDetails
}

export const DetailsOverlay = ({ micActive, streamerDetails }: Props) => {
   const displayName = getStreamerDisplayName(
      streamerDetails.firstName,
      streamerDetails.lastName
   )

   return (
      <FloatingContent sx={styles.root}>
         <Stack
            mt="auto"
            width="100%"
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={0.3}
         >
            <Stack spacing={-0.5} minWidth={0}>
               {Boolean(displayName) && (
                  <Typography variant="brandedBody" sx={styles.displayName}>
                     {displayName}
                  </Typography>
               )}
               {Boolean(streamerDetails.role) && (
                  <Typography sx={styles.role} variant="small">
                     {streamerDetails.role}
                  </Typography>
               )}
            </Stack>
            <Stack direction="row" spacing={1.5}>
               <Grow in={!micActive} unmountOnExit>
                  <Box sx={styles.micOff} component={MicOff} />
               </Grow>
               <Info />
            </Stack>
         </Stack>
      </FloatingContent>
   )
}
