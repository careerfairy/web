import * as GridItems from "./blocks/gridItems"
import { parseGridItemsMdx } from "../../data/hygraph/util"
import {
   HygraphResponseLayout,
   HygraphResponseTheme,
   SerializedMarkdown,
} from "../../types/cmsTypes"
import { ElementType, FC } from "react"
import Box from "@mui/material/Box"
import { Typography } from "@mui/material"
import Container from "../views/common/Section/Container"
import ThemedMDXRemote from "./ThemedMDXRemote"

type Props = {
   layout: HygraphResponseLayout
   gridSubtitle: SerializedMarkdown
   gridItems?: Awaited<ReturnType<typeof parseGridItemsMdx>>
   gridItemComponent?: string
   gridHeadline?: string
   gridTag?: ElementType
   gridTitle?: string
   theme?: HygraphResponseTheme
   numberOfColumns?: string
}

export const GridBlock: FC<Props> = ({
   children,
   gridItemComponent,
   gridItems,
   gridHeadline,
   gridSubtitle,
   gridTag,
   gridTitle,
   layout = "STACKED",
   theme = "WHITE",
   numberOfColumns = 1,
}) => {
   if (!gridItems || !gridItems.length) return null

   const splitLayout = layout === "SPLIT"

   return (
      <Box overflow="hidden" bgcolor={theme === "LIGHT" ? "gray.50" : "white"}>
         <Container>
            <Box
               position="relative"
               py={{
                  xs: 4,
                  sm: 6,
               }}
               sx={{
                  display: {
                     lg: splitLayout && "grid",
                  },
                  gridColumnGap: {
                     lg: splitLayout && 8,
                  },
                  gridTemplateColumns: {
                     lg: splitLayout && "repeat(3, 1fr)",
                  },
               }}
            >
               <Box
                  sx={{
                     textAlign: {
                        lg: splitLayout && "center",
                     },
                     gridColumn: {
                        lg: splitLayout && "span 1 / span 1",
                     },
                  }}
               >
                  {gridHeadline && (
                     <Typography
                        component="h2"
                        variant="h5"
                        fontSize="md"
                        fontWeight="500"
                        color="secondary.main"
                        textTransform="uppercase"
                     >
                        {gridHeadline}
                     </Typography>
                  )}
                  <Typography
                     mt={1}
                     component="p"
                     variant="h4"
                     fontWeight="500"
                  >
                     {gridTitle}
                  </Typography>

                  {gridSubtitle && (
                     <Box
                        mt={2}
                        mb={1}
                        fontSize="xl"
                        color="text.secondary"
                        mx={{ lg: "auto" }}
                     >
                        <ThemedMDXRemote {...gridSubtitle.mdx} />
                     </Box>
                  )}
               </Box>
               <Box
                  component={gridTag || "dl"}
                  mt={{ xs: 1, lg: splitLayout && 0 }}
                  spacing={[10, 5]}
                  sx={{
                     gridTemplateColumns: {
                        xs: "repeat(1, 1fr)",
                        lg: `repeat(${numberOfColumns}, 1fr)`,
                     },
                     display: "grid",
                     gridColumn: {
                        lg: "span 2 / span 2",
                     },
                     gridGap: {
                        xs: 5,
                        sm: 10,
                     },
                  }}
               >
                  {children ||
                     gridItems.map((gridItem) => {
                        const Component =
                           GridItems[gridItemComponent] ||
                           GridItems[gridItem.__typename]

                        if (!Component) return null

                        return <Component key={gridItem.id} {...gridItem} />
                     })}
               </Box>
            </Box>
         </Container>
      </Box>
   )
}

export default GridBlock
