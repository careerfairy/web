import React from "react"
import TopBar from "./TopBar"
import { styles } from "../../materialUI/styles/layoutStyles/landingLayoutStyles"
import FooterV2 from "../../components/views/footer/FooterV2"
import { getResizedUrl } from "../../components/helperFunctions/HelperFunctions"
import { Box } from "@mui/material"
import GenericDrawer from "../../components/views/navbar/GenericDrawer"

const drawerWidth = 300
const LandingLayout = ({ topImage, bottomImage, children }) => {
   const stylesWithProps = styles({
      topImage,
      bottomImage: getResizedUrl(bottomImage, "md"),
   })

   return (
      <Box sx={stylesWithProps.root}>
         <TopBar />
         <GenericDrawer drawerWidth={drawerWidth} />
         <Box sx={stylesWithProps.wrapper}>
            <Box sx={stylesWithProps.contentContainer}>
               <Box sx={stylesWithProps.content}>
                  {children}
                  <FooterV2 background={"transparent"} />
               </Box>
            </Box>
         </Box>
      </Box>
   )
}

export default LandingLayout
