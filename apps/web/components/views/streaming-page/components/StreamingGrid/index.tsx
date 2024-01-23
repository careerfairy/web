import { sxStyles } from "types/commonTypes"
import { Box } from "@mui/material"
import React from "react"

const styles = sxStyles({
   root: {
      border: "1px solid green",
      flex: 1,
   },
})

export const StreamingGrid = () => {
   return <Box sx={styles.root}>StreamingGrid</Box>
}
