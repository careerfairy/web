import React from "react"
import TopBar from "./TopBar"
import { styles } from "../../materialUI/styles/layoutStyles/generalLayoutStyles"
import FooterV2 from "../../components/views/footer/FooterV2"
import { Box } from "@mui/material"
import GenericDrawer from "../../components/views/navbar/GenericDrawer"

const drawerWidth = 300
const GeneralLayout = ({
   children,
   fullScreen,
   hideNavOnScroll = false,
   backgroundColor = undefined,
}) => {
   return (
      <Box
         sx={(theme) => ({
            ...styles.root(theme),
            minHeight: fullScreen && "100vh",
            backgroundColor,
         })}
      >
         <TopBar hideNavOnScroll={hideNavOnScroll} />
         <GenericDrawer drawerWidth={drawerWidth} />
         <Box sx={styles.wrapper}>
            <Box sx={styles.contentContainer}>
               <Box sx={styles.content}>
                  {children}
                  <FooterV2 sx={fullScreen && { mt: "auto" }} />
               </Box>
            </Box>
         </Box>
      </Box>
   )
}

export default GeneralLayout
