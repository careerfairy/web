import { Stack, Button } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   button: {
      textTransform: "none",
      fontWeight: "700",
   },
})

export const LivestreamButtonActions = () => {
   return (
      <Stack direction="row" spacing={3}>
         <Button variant="outlined" color="secondary" sx={styles.button}>
            Save & Update
         </Button>

         <Button variant="contained" disabled sx={styles.button}>
            Publish
         </Button>
      </Stack>
   )
}
