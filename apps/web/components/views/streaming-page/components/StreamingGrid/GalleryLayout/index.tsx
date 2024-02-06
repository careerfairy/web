import { Box } from "@mui/material"
import { useMemo } from "react"
import { sxStyles } from "types/commonTypes"
import { LocalMicrophoneAndCameraUser } from "../../streaming/LocalMicrophoneAndCameraUser"
import { GridCarousel } from "../GridCarousel"
import { LayoutGrid } from "../LayoutGrid"
import { useSortedStreams } from "../useSortedStreams"
import { getPaginatedGridLayout } from "../util"
import { useGalleryLayout } from "./useGalleryLayout"
import { RemoteStreamer } from "../../streaming"
import { TrackBoundary } from "agora-rtc-react"

const styles = sxStyles({
   root: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
   },
})

export const GalleryLayout = () => {
   const streams = useSortedStreams()

   const layout = useGalleryLayout(streams.length)

   const gridPages = useMemo(
      () => getPaginatedGridLayout(streams, layout),
      [streams, layout]
   )

   return (
      <TrackBoundary>
         <Box sx={styles.root}>
            <GridCarousel
               gridPages={gridPages.map((pageStreamers, pageIndex) => (
                  <LayoutGrid
                     key={pageIndex}
                     elements={pageStreamers}
                     isLastButNotFirstPage={
                        pageIndex === gridPages.length - 1 && pageIndex !== 0
                     }
                     layout={layout}
                     renderGridItem={(user) => (
                        <LayoutGrid.Item
                           key={user.user.uid}
                           layoutColumns={layout.columns}
                        >
                           <GridItemContent user={user} />
                        </LayoutGrid.Item>
                     )}
                  />
               ))}
            />
         </Box>
      </TrackBoundary>
   )
}

type GridItemContentProps = {
   user: ReturnType<typeof useSortedStreams>[number]
}

const GridItemContent = ({ user }: GridItemContentProps) => {
   console.log("🚀 ~ file: index.tsx:64 ~ GridItemContent ~ user:", user)
   if (user.type === "local") {
      return <LocalMicrophoneAndCameraUser />
   }
   return <RemoteStreamer key={user.user.uid} user={user.user} />
}
