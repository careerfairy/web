import { sxStyles } from "types/commonTypes"
import { Container, Stack } from "@mui/material"
import { StreamingGrid } from "../StreamingGrid"
import { SidePanel } from "../SidePanel"
import {
   useSideDrawer,
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import { useIsSpotlightMode } from "store/selectors/streamingAppSelectors"

const styles = sxStyles({
   root: {
      overflowY: "auto",
   },
   fullHeight: {
      height: "100%",
   },
   stack: {
      flex: 1,
   },
   stackMobileLandscape: {
      flexDirection: "column",
   },
})

export const MiddleContent = () => {
   const isLandscape = useStreamIsLandscape()
   const isMobile = useStreamIsMobile()
   const isSpotlightMode = useIsSpotlightMode()

   const { isOpen } = useSideDrawer()

   return (
      <Container sx={[styles.root, styles.fullHeight]} maxWidth="xl">
         <Stack
            sx={[styles.stack, styles.fullHeight]}
            direction="row"
            spacing={isMobile || !isOpen ? 0 : 2.5}
            pt={isLandscape ? 1.5 : isMobile ? 3 : isSpotlightMode ? 2 : 3.875}
            pb={
               isLandscape ? 3.125 : isMobile ? 2 : isSpotlightMode ? 2 : 5.875
            }
         >
            <StreamingGrid />
            <SidePanel />
         </Stack>
      </Container>
   )
}
