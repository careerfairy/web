import { sxStyles } from "@careerfairy/shared-ui"
import { Container, Stack } from "@mui/material"
import { SidePanel, StreamingGrid } from ".."
import { useMeasure } from "react-use"

const styles = sxStyles({
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
   const [ref, { height }] = useMeasure<HTMLDivElement>()

   return (
      <Container sx={styles.fullHeight} maxWidth={false}>
         <Stack
            sx={[styles.stack, styles.fullHeight]}
            direction="row"
            spacing={2.625}
            ref={ref}
         >
            <StreamingGrid />
            <SidePanel parentHeight={height} />
         </Stack>
      </Container>
   )
}
