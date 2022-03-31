import React, { FC } from "react"
import Box from "@mui/material/Box"

const CaseStudyLayout: FC<> = ({ children }) => {
   return (
      <Box
         sx={{
            minHeight: "100vh",
         }}
      >
         {children}
      </Box>
   )
}

export default CaseStudyLayout
