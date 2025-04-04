import { Box, Stack } from "@mui/material"
import { TrackBoundary } from "agora-rtc-react"
import {
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import { sxStyles } from "types/commonTypes"
import { ClickToHearOverlay } from "./ClickToHearOverlay"
import { Spotlight } from "./Spotlight/Spotlight"
import { Gallery } from "./gallery/Gallery"
import { useSpotlightStream } from "./useSpotlightStream"
import { useStreams } from "./useStreams"

const styles = sxStyles({
   root: {
      flex: 1,
      display: "flex",
      position: "relative",
      mt: "-8px !important",
   },
   content: {
      width: "100%",
      height: "100%",
   },
})

export const StreamingGrid = () => {
   const isLandscape = useStreamIsLandscape()
   const isMobile = useStreamIsMobile()

   const streams = useStreams()
   const { spotlightStream, otherStreams } = useSpotlightStream(streams)

   const spacing = isLandscape ? 0.75 : isMobile ? 1.125 : 1.25

   return (
      <Box sx={styles.root}>
         <TrackBoundary>
            <Stack
               direction={isLandscape ? "row-reverse" : "column"}
               sx={styles.content}
               spacing={spacing}
            >
               <Gallery spacing={spacing} streams={otherStreams} />
               <Spotlight stream={spotlightStream} />
            </Stack>
         </TrackBoundary>
         <ClickToHearOverlay />
      </Box>
   )
}
