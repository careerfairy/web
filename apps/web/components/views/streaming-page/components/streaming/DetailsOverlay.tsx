import React from "react"
import { FloatingContent } from "./VideoTrackWrapper"
import { sxStyles } from "types/commonTypes"
import { Box, Grow, Stack, Typography } from "@mui/material"
import { MicOff, Info } from "react-feather"
import { StreamerDetails } from "components/custom-hook/streaming/useStreamerDetails"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"

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
      lineHeight: 1, // make the text height the exact height of the text instead of style-guide height
   },
})

type Props = {
   micMuted: boolean
   streamerDetails: StreamerDetails
}

export const DetailsOverlay = ({ micMuted, streamerDetails }: Props) => {
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
            <Stack minWidth={0}>
               <Typography variant="brandedBody" sx={styles.displayName}>
                  {streamerDetails.firstName || ""}{" "}
                  {streamerDetails.lastName || ""}
               </Typography>
               <Typography sx={styles.role} variant="small">
                  {streamerDetails.role}
               </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5}>
               <Grow in={micMuted} unmountOnExit>
                  <Box sx={styles.micOff} component={MicOff} />
               </Grow>
               <Info />
            </Stack>
         </Stack>
      </FloatingContent>
   )
}
