import { ReactNode, memo } from "react"
import { Box } from "@mui/material"
import { sxStyles } from "types/commonTypes"

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
   children: ReactNode
}

export const Layout = memo(({ children }: Props) => {
   return (
      <Box sx={styles.root} component="main">
         {children}
      </Box>
   )
})

Layout.displayName = "Layout"
