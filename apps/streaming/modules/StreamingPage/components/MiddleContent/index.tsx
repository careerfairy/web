import { sxStyles } from "@careerfairy/shared-ui"
import { Stack } from "@mui/material"
import { SidePanel, StreamingGrid } from ".."

const styles = sxStyles({
   root: {
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
      <Stack sx={styles.root} direction="row" spacing={2.625}>
         <StreamingGrid />
         <SidePanel />
      </Stack>
   )
}
