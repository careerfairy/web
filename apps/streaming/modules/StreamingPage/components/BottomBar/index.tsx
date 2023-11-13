import { sxStyles } from "@careerfairy/shared-ui"
import { Box } from "@mui/material"
import React from "react"

const styles = sxStyles({
   root: {
      border: "1px solid pink",
   },
})

export const BottomBar = () => {
   return <Box sx={styles.root}>BottomBar</Box>
}
