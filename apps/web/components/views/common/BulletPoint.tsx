import React from "react"
import Box from "@mui/material/Box"
import { SxProps, Theme } from "@mui/material/styles"

const BulletPoint = ({ sx }: Props) => (
   <Box
      component="span"
      sx={[
         { display: "inline-block", mx: 0.5, transform: "scale(0.8)" },
         ...(Array.isArray(sx) ? sx : [sx]),
      ]}
   >
      •
   </Box>
)
interface Props {
   sx?: SxProps<Theme>
}
export default BulletPoint
