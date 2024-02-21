import { Box } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { LocalUserStream, LocalScreenStream } from "../../streaming/LocalStream"
import { GridCarousel } from "../GridCarousel"
import { LayoutGrid } from "../LayoutGrid"
import { useSortedStreams } from "../useSortedStreams"
import { RemoteStreamer } from "../../streaming"
import { TrackBoundary } from "agora-rtc-react"
import { UserStreamProvider } from "components/views/streaming-page/context/UserStream"
import { UserStream } from "components/views/streaming-page/types"
import { Layout } from "../types"

const styles = sxStyles({
   root: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
   },
})

type Props = {
   gridPages: UserStream[][]
   layout: Layout
}

export const StreamsGrid = ({ gridPages, layout }: Props) => {
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
                           <UserStreamProvider user={user}>
                              <GridItemContent user={user} />
                           </UserStreamProvider>
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
      return <LocalUserStream />
   }
   if (user.type === "local-user-screen") {
      return <LocalScreenStream />
   }

   return <RemoteStreamer />
}
