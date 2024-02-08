import React from "react"
import { FloatingContent } from "./VideoTrackWrapper"
import { sxStyles } from "types/commonTypes"
import { Box, Grow, Stack, Typography } from "@mui/material"
import { MicOff, Info } from "react-feather"
import { StreamerDetails } from "components/custom-hook/streaming/useStreamerDetails"

const styles = sxStyles({
   root: {
      color: "white",
      p: 2,
      display: "flex",
   },
   micOff: {
      color: "error.600",
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
            alignItems="end"
         >
            <Stack spacing={0.5}>
               <Typography variant="brandedBody" fontWeight={600}>
                  {streamerDetails.firstName || ""}{" "}
                  {streamerDetails.lastName || ""}
               </Typography>
               <Typography variant="small">{streamerDetails.role}</Typography>
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
