import React from "react"
import { Box } from "@mui/material"
import { sxStyles } from "@careerfairy/shared-ui"

const styles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      background: "#F7F8FC",
      maxHeight: "100vh",
   },
})

type Props = {
   children: React.ReactNode
}

export const Layout = ({ children }: Props) => {
   return (
      <Box sx={styles.root} component="main">
         {children}
      </Box>
   )
}
