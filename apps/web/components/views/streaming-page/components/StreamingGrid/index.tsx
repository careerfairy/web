import { sxStyles } from "types/commonTypes"
import { Box, Stack } from "@mui/material"
import React, { useMemo } from "react"
import { StreamsGrid } from "./StreamsGrid"
import { useIsSpotlightMode } from "store/selectors/streamingAppSelectors"
import { useStreamIsLandscape } from "components/custom-hook/streaming"
import { useStreams } from "./useStreams"
import { useGalleryLayout } from "./StreamsGrid/useGalleryLayout"
import { useSortedStreams } from "./useSortedStreams"
import { getPaginatedGridLayout } from "./util"

const styles = sxStyles({
   root: {
      flex: 1,
      display: "flex",
   },
   spotlight: {
      height: 0,
      // width: "100%",
      border: "1px solid red",
      transition: (theme) =>
         theme.transitions.create(["height", "width"], {
            duration: theme.transitions.duration.complex,
         }),
   },
   spotlightActive: {
      height: "50%",
   },
})

export const StreamingGrid = () => {
   const isSpotlightMode = useIsSpotlightMode()
   const isLandscape = useStreamIsLandscape()
   console.log(
      "🚀 ~ file: index.tsx:16 ~ StreamingGrid ~ isSpotlightMode:",
      isSpotlightMode
   )

   const streams = useStreams()
   const layout = useGalleryLayout(streams.length)

   const pageSize = layout.rows * layout.columns

   const sortedStreams = useSortedStreams(streams, pageSize)

   const gridPages = useMemo(
      () => getPaginatedGridLayout(sortedStreams, layout),
      [sortedStreams, layout]
   )

   return (
      <Stack direction={isLandscape ? "row" : "column"} sx={styles.root}>
         <StreamsGrid gridPages={gridPages} layout={layout} />
         <Box
            sx={[styles.spotlight, isSpotlightMode && styles.spotlightActive]}
         />
      </Stack>
   )
}
