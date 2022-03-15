import { Box, CircularProgress } from "@mui/material"
import React from "react"

const CircularLoader = (props) => (
   <Box display="flex" justifyContent="center" {...props}>
      <CircularProgress />
   </Box>
)

export default CircularLoader
