import React from "react"
import { FloatingContent } from "./VideoTrackWrapper"
import { sxStyles } from "types/commonTypes"
import { CircularProgress } from "@mui/material"

const styles = sxStyles({
   root: {
      bgcolor: (theme) => theme.brand.black[800],
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
   },
})

export const Loader = () => {
   return (
      <FloatingContent sx={styles.root}>
         <CircularProgress size={50} />
      </FloatingContent>
   )
}
