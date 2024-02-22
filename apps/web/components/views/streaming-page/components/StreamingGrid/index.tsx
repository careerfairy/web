import { sxStyles } from "types/commonTypes"
import { Slide, Stack } from "@mui/material"
import React, { useMemo } from "react"
import { StreamsGrid } from "./StreamsGrid"
import {
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import { useStreams } from "./useStreams"
import { useGalleryLayout } from "./StreamsGrid/useGalleryLayout"
import { useSortedStreams } from "./useSortedStreams"
import { getPaginatedGridLayout } from "./util"
import { useSpotlightStream } from "./useSpotlightStream"
import { Spotlight } from "./Spotlight/Spotlight"
import { TrackBoundary } from "agora-rtc-react"
import { useIsSpotlightMode } from "store/selectors/streamingAppSelectors"

const styles = sxStyles({
   root: {
      flex: 1,
      display: "flex",
   },
})

export const StreamingGrid = () => {
   const isLandscape = useStreamIsLandscape()
   const isMobile = useStreamIsMobile()
   const isSpotlightMode = useIsSpotlightMode()

   const streams = useStreams()
   const { spotlightStream, otherStreams } = useSpotlightStream(streams)

   const layout = useGalleryLayout(otherStreams.length)
   const pageSize = layout.rows * layout.columns
   const sortedStreams = useSortedStreams(otherStreams, pageSize)

   const gridPages = useMemo(
      () => getPaginatedGridLayout(sortedStreams, layout),
      [sortedStreams, layout]
   )

   const spacing = isLandscape ? 0.75 : isMobile ? 1.125 : 1.25

   return (
      <TrackBoundary>
         <Stack
            direction={isLandscape ? "row-reverse" : "column"}
            sx={styles.root}
            spacing={spacing}
         >
            <StreamsGrid
               spacing={spacing}
               gridPages={gridPages}
               layout={layout}
            />
            <Slide
               in={isSpotlightMode}
               direction={isLandscape ? "right" : "up"}
               unmountOnExit
            >
               <Spotlight stream={spotlightStream} />
            </Slide>
         </Stack>
      </TrackBoundary>
   )
}
