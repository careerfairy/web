import { Box } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { GridCarousel } from "../GridCarousel"
import { LayoutGrid } from "../LayoutGrid"
import { UserStream } from "components/views/streaming-page/types"
import { Layout } from "../types"
import { UserStreamComponent } from "./UserStreamComponent"
import { useIsSpotlightMode } from "store/selectors/streamingAppSelectors"
import { useStreamIsLandscape } from "components/custom-hook/streaming"

const dynamicStyles = (spacing: number, isLandscape: boolean) =>
   sxStyles({
      rootSpotlight: (theme) => ({
         display: "flex",
         ...(isLandscape
            ? {
                 width: `calc(208px - ${theme.spacing(spacing)})`,
              }
            : {
                 height: {
                    xs: `calc(132px - ${theme.spacing(spacing)})`,
                    tablet: `calc(195px - ${theme.spacing(spacing)})`,
                 },
              }),
      }),
      root: {
         flex: 1,
         display: "flex",
         flexDirection: "column",
      },
   })

type Props = {
   gridPages: UserStream[][]
   layout: Layout
   spacing: number
}

export const StreamsGrid = ({ gridPages, layout, spacing }: Props) => {
   const isSpotlightMode = useIsSpotlightMode()
   const isLandscape = useStreamIsLandscape()

   const componentStyles = dynamicStyles(spacing, isLandscape)

   return (
      <Box
         sx={
            isSpotlightMode
               ? componentStyles.rootSpotlight
               : componentStyles.root
         }
      >
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
                        <UserStreamComponent user={user} />
                     </LayoutGrid.Item>
                  )}
               />
            ))}
         />
      </Box>
   )
}
