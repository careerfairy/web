import { sxStyles } from "types/commonTypes"
import { Box } from "@mui/material"
import React from "react"
import { GalleryLayout } from "./GalleryLayout"

const styles = sxStyles({
   root: {
      flex: 1,
      display: "flex",
   },
})

export const StreamingGrid = () => {
   return (
      <Box sx={styles.root}>
         <GalleryLayout />
      </Box>
   )
}
