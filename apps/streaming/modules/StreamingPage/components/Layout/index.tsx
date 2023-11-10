import React from "react"
import { Box } from "@mui/material"
import { sxStyles } from "@careerfairy/shared-ui"

const styles = sxStyles({
   root: {
      border: "1px solid black",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      background: "#F7F8FC",
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
