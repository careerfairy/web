import { Box } from "@mui/material"
import {
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import { UserStream } from "components/views/streaming-page/types"
import { useMemo } from "react"
import { useIsSpotlightMode } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import {
   GradientProvider,
   calculateGradientControl,
} from "../../streaming/LinearGradient"
import { GridCarousel } from "../GridCarousel"
import { LayoutGrid } from "../LayoutGrid"
import { useSortedStreams } from "../useSortedStreams"
import { getPaginatedGridLayout } from "../util"
import { useGalleryLayout } from "./useGalleryLayout"
import { UserStreamComponent } from "./UserStreamComponent"

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
            tablet: `calc(160px - ${theme.spacing(spacing)})`,
         },
      }),
      spotlightActiveLandscape: (theme) => ({
         // Shrink the width of the gallery to make space for the spotlight
         width: `calc(208px - ${theme.spacing(spacing)})`,
      }),
   })

const calculateGridItemMaxWidth = (
   isSingleRowMode: boolean,
   isMobile: boolean
) => {
   if (isSingleRowMode) {
      return isMobile ? "180px !important" : "320px !important"
   }
   return undefined
}

type Props = {
   streams: UserStream[]
   spacing: number
}

export const Gallery = ({ streams, spacing }: Props) => {
   const isSpotlightMode = useIsSpotlightMode()
   const isLandscape = useStreamIsLandscape()
   const isMobile = useStreamIsMobile()

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

   const isSingleRowMode = isSpotlightMode && !isLandscape

   return (
      <Box sx={[styles.root, getConditionalStyles()]}>
         <GridCarousel
            floatingDots={Boolean(isLandscape && isSpotlightMode)}
            navigationMode={isSingleRowMode ? "arrows" : "dots"}
            gridPages={gridPages.map((pageStreamers, pageIndex) => (
               <LayoutGrid
                  key={pageIndex}
                  elements={pageStreamers}
                  isLastButNotFirstPage={
                     pageIndex === gridPages.length - 1 && pageIndex !== 0
                  }
                  layout={layout}
                  renderGridItem={(stream, index, streams) => (
                     <LayoutGrid.Item
                        key={stream.user.uid}
                        layoutColumns={layout.columns}
                        maxWidth={calculateGridItemMaxWidth(
                           isSingleRowMode,
                           isMobile
                        )}
                     >
                        <GradientProvider
                           {...calculateGradientControl({
                              index,
                              layoutRows: layout.rows,
                              pageIndex,
                              pageSize,
                              pagesLength: gridPages.length,
                              streamsLength: streams.length,
                           })}
                        >
                           <UserStreamComponent user={stream} />
                        </GradientProvider>
                     </LayoutGrid.Item>
                  )}
               />
            ))}
         />
      </Box>
   )
}
