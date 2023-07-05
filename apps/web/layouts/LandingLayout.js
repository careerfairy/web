import React from "react"
import { styles } from "../materialUI/styles/layoutStyles/landingLayoutStyles"
import Footer from "../components/views/footer/Footer"
import { getResizedUrl } from "../components/helperFunctions/HelperFunctions"
import { Box } from "@mui/material"
import GeneralNavDrawer from "../components/views/navbar/GeneralNavDrawer"
import GenericHeader from "../components/views/header/GenericHeader"
import useGeneralLinks from "../components/custom-hook/useGeneralLinks"

const LandingLayout = ({ topImage, bottomImage, children }) => {
   const stylesWithProps = styles({
      topImage,
      bottomImage: getResizedUrl(bottomImage, "md"),
   })
   const { landingLinks } = useGeneralLinks()
   return (
      <Box sx={stylesWithProps.root}>
         <GenericHeader position={"fixed"} links={landingLinks} transparent />
         <Box sx={stylesWithProps.wrapper}>
            <Box sx={stylesWithProps.contentContainer}>
               <Box sx={stylesWithProps.content}>
                  <GeneralNavDrawer />
                  {children}
                  <Footer background={"transparent"} />
               </Box>
            </Box>
         </Box>
      </Box>
   )
}

export default LandingLayout
