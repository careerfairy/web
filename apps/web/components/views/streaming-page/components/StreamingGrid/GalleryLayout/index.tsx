import { Box } from "@mui/material"
import { useMemo } from "react"
import { sxStyles } from "types/commonTypes"
import {
   LocalMicrophoneAndCameraUser,
   LocalUserScreen,
} from "../../streaming/LocalMicrophoneAndCameraUser"
import { GridCarousel } from "../GridCarousel"
import { LayoutGrid } from "../LayoutGrid"
import { useSortedStreams } from "../useSortedStreams"
import { getPaginatedGridLayout } from "../util"
import { useGalleryLayout } from "./useGalleryLayout"
import { RemoteStreamer } from "../../streaming"
import { TrackBoundary } from "agora-rtc-react"
import { useStreams } from "../useStreams"

const styles = sxStyles({
   root: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
   },
})

export const GalleryLayout = () => {
   const streams = useStreams()
   const layout = useGalleryLayout(streams.length)

   const pageSize = layout.rows * layout.columns

   const sortedStreams = useSortedStreams(streams, pageSize)

   const gridPages = useMemo(
      () => getPaginatedGridLayout(sortedStreams, layout),
      [sortedStreams, layout]
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
   if (user.type === "local-user") {
      return <LocalMicrophoneAndCameraUser />
   }
   if (user.type === "local-user-screen") {
      return <LocalUserScreen />
   }

   return (
      <RemoteStreamer
         containVideo={user.type === "remote-user-screen"}
         key={user.user.uid}
         user={user.user}
      />
   )
}
