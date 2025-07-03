import { Typography } from "@mui/material"

import { Stack } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      width: "100%",
      borderRadius: 2,
      border: "1px solid #E0E0E0",
      padding: 2,
   },
})

export const OverviewSearch = () => {
   return (
      <Stack sx={styles.root}>
         <Typography>Jobs search</Typography>
         <Stack direction="row" spacing={1}>
            <Typography>Filters here</Typography>
         </Stack>
      </Stack>
   )
}
