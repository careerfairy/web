import { sxStyles } from "types/commonTypes"
import { Stack } from "@mui/material"
import React from "react"
import { Gallery } from "./gallery/Gallery"
import {
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import { useStreams } from "./useStreams"
import { useSpotlightStream } from "./useSpotlightStream"
import { Spotlight } from "./Spotlight/Spotlight"
import { TrackBoundary } from "agora-rtc-react"

const styles = sxStyles({
   root: {
      flex: 1,
      display: "flex",
   },
})

export const StreamingGrid = () => {
   const isLandscape = useStreamIsLandscape()
   const isMobile = useStreamIsMobile()

   const streams = useStreams()
   const { spotlightStream, otherStreams } = useSpotlightStream(streams)
   console.log("🚀", {
      spotlightStream,
      otherStreams,
   })

   const spacing = isLandscape ? 0.75 : isMobile ? 1.125 : 1.25

   return (
      <TrackBoundary>
         <Stack
            direction={isLandscape ? "row-reverse" : "column"}
            sx={styles.root}
            spacing={spacing}
         >
            <Gallery spacing={spacing} streams={otherStreams} />
            <Spotlight stream={spotlightStream} />
         </Stack>
      </TrackBoundary>
   )
}
