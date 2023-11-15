import { sxStyles } from "@careerfairy/shared-ui"
import { Container, Stack } from "@mui/material"
import { SidePanel, StreamingGrid } from ".."

const styles = sxStyles({
   root: {
      overflowY: "auto",
   },
   fullHeight: {
      height: "100%",
   },

   stack: {
      pt: {
         xs: 3,
         sm: 4.875,
      },
      pb: 6,
      flex: 1,
   },
})

export const MiddleContent = () => {
   return (
      <Container sx={[styles.root, styles.fullHeight]} maxWidth={false}>
         <Stack
            sx={[styles.stack, styles.fullHeight]}
            direction="row"
            spacing={2.625}
         >
            <StreamingGrid />
            <SidePanel />
         </Stack>
      </Container>
   )
}
