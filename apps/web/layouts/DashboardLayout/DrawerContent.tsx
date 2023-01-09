import { Box } from "@mui/material"
import React from "react"
import useIsMobile from "../../components/custom-hook/useIsMobile"

const DrawerContent = () => {
   const isMobile = useIsMobile()
   return (
      <>
         <Box sx={{ display: { xs: "block", md: "none" } }}>
            <Box sx={{ display: "flex", p: 2, mx: "auto" }}>LogoSection</Box>
         </Box>

         {isMobile ? (
            <Box px={2}>Content MobileView</Box>
         ) : (
            <Box px={2}>Content BrowserView</Box>
         )}
      </>
   )
}

export default DrawerContent
