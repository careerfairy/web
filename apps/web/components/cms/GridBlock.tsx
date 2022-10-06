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

   const stackLayout = layout === "STACK"
   const splitLayout = layout === "SPLIT"

   return (
      <Box overflow="hidden" bgcolor={theme === "LIGHT" ? "gray.50" : "white"}>
         <Container
         // position="relative"
         // // maxW="7xl"
         // sx={{
         //    maxWidth: "calc(100vw - 2rem)",
         // }}
         // mx="auto"
         // py={12}
         // px={[4, 6, null, 8]}
         >
            {/*{splitLayout && (*/}
            {/*   <Box*/}
            {/*      as={DotsSVG}*/}
            {/*      color="gray.200"*/}
            {/*      position="absolute"*/}
            {/*      display={{ base: "none", lg: "block" }}*/}
            {/*      top="100%"*/}
            {/*      right="100%"*/}
            {/*      left="auto"*/}
            {/*      transform="translate(66.66%, -75%)"*/}
            {/*   />*/}
            {/*)}*/}

            <Box
               position="relative"
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
                     variant="h3"
                     fontWeight="500"
                     color="gray.900"
                     sx={{}}
                  >
                     {gridTitle}
                  </Typography>

                  {gridSubtitle && (
                     <Box
                        mt={2}
                        // sx={{
                        //    maxWidth: "calc(100vw - 2rem)",
                        // }}
                        fontSize="xl"
                        color="gray.500"
                        mx={{ lg: "auto" }}
                     >
                        <ThemedMDXRemote {...gridSubtitle.mdx} />
                     </Box>
                  )}
               </Box>
               <Box
                  component={gridTag || "dl"}
                  mt={{ base: 10, lg: splitLayout && 0 }}
                  spacing={[10, 0]}
                  display={{ sm: "grid" }}
                  gridColumnGap={{ sm: 8 }}
                  gridRowGap={{ sm: 10 }}
                  gridColumn={{ lg: "span 2 / span 2" }}
                  gridTemplateColumns={{
                     base: "repeat(1, 1fr)",
                     lg: `repeat(${numberOfColumns}, 1fr)`,
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
