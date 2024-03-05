import { Box } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { GridCarousel } from "../GridCarousel"
import { LayoutGrid } from "../LayoutGrid"
import { UserStream } from "components/views/streaming-page/types"
import { UserStreamComponent } from "./UserStreamComponent"
import { useIsSpotlightMode } from "store/selectors/streamingAppSelectors"
import { useStreamIsLandscape } from "components/custom-hook/streaming"
import { useGalleryLayout } from "./useGalleryLayout"
import { useSortedStreams } from "../useSortedStreams"
import { useMemo } from "react"
import { getPaginatedGridLayout } from "../util"

const dynamicStyles = (spacing: number) =>
   sxStyles({
      root: {
         display: "flex",
         flexDirection: "column",
         width: "100%",
         height: "100%",
      },
      spotlightActivePortrait: (theme) => ({
         // Shrink the height of the gallery to make space for the spotlight
         height: {
            xs: `calc(132px - ${theme.spacing(spacing)})`,
            tablet: `calc(195px - ${theme.spacing(spacing)})`,
         },
      }),
      spotlightActiveLandscape: (theme) => ({
         // Shrink the width of the gallery to make space for the spotlight
         width: `calc(208px - ${theme.spacing(spacing)})`,
      }),
   })

type Props = {
   streams: UserStream[]
   spacing: number
}

export const Gallery = ({ streams, spacing }: Props) => {
   const isSpotlightMode = useIsSpotlightMode()
   const isLandscape = useStreamIsLandscape()

   const layout = useGalleryLayout(streams.length)
   const pageSize = layout.rows * layout.columns
   const sortedStreams = useSortedStreams(streams, pageSize)

   const gridPages = useMemo(
      () => getPaginatedGridLayout(sortedStreams, layout),
      [sortedStreams, layout]
   )

   const styles = dynamicStyles(spacing)

   const getConditionalStyles = () => {
      if (!isSpotlightMode) return null

      return isLandscape
         ? styles.spotlightActiveLandscape
         : styles.spotlightActivePortrait
   }

   return (
      <Box sx={[styles.root, getConditionalStyles()]}>
         <GridCarousel
            floatingDots={Boolean(isLandscape && isSpotlightMode)}
            navigationMode={isSpotlightMode && !isLandscape ? "arrows" : "dots"}
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
                        <UserStreamComponent user={user} />
                     </LayoutGrid.Item>
                  )}
               />
            ))}
         />
      </Box>
   )
}
