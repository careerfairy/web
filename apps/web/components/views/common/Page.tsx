import React, { FC } from "react"
import Box from "@mui/material/Box"
import { SxProps } from "@mui/material"
import { Theme } from "@mui/material/styles"
const styles = {
   root: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      bgcolor: "white",
      position: "relative",
   },
}
interface Props {
   children: React.ReactNode
   sx?: SxProps<Theme>
}
const Page: FC<Props> = ({ sx, ...props }) => {
   return (
      <Box sx={[styles.root, ...(Array.isArray(sx) ? sx : [sx])]} {...props} />
   )
}

export default Page
