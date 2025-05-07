import { Stack } from "@mui/material"

import { Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      width: "339px",
      minHeight: "80vh",
      borderRadius: 2,
      border: "1px solid #E0E0E0",
      padding: 2,
   },
})

export const CustomJobsOverviewList = () => {
   return (
      <Stack sx={styles.root}>
         <Typography>Custom jobs overview list</Typography>
      </Stack>
   )
}
