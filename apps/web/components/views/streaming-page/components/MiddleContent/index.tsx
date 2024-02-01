import { sxStyles } from "types/commonTypes"
import { Container, Stack } from "@mui/material"
import { SidePanel, StreamingGrid } from ".."
import {
   useSideDrawer,
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"

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
   const { isOpen } = useSideDrawer()

   return (
      <Container sx={[styles.root, styles.fullHeight]} maxWidth={false}>
         <Stack
            sx={[styles.stack, styles.fullHeight]}
            direction="row"
            spacing={isMobile || !isOpen ? 0 : 2.5}
            pt={isLandscape ? 1.5 : isMobile ? 3 : 3.875}
            pb={isLandscape ? 3.125 : isMobile ? 6.125 : 7}
         >
            <StreamingGrid />
            <SidePanel />
         </Stack>
      </Container>
   )
}
