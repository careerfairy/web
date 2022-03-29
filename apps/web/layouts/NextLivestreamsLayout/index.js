import PropTypes from "prop-types"
import React, { useState } from "react"
import NavBar from "./NavBar"
import { styles } from "../../materialUI/styles/layoutStyles/nextLivestreamsLayoutStyles"
import TopBar from "./TopBar"
import useGeneralLinks from "../../components/custom-hook/useGeneralLinks"
import FooterV2 from "../../components/views/footer/FooterV2"
import { useTheme } from "@mui/material/styles"
import { Box } from "@mui/material"

const NextLivestreamsLayout = (props) => {
   const { children, currentGroup } = props

   const { mainLinks, secondaryLinks } = useGeneralLinks()
   const theme = useTheme()

   const [isMobileNavOpen, setMobileNavOpen] = useState(false)
   const handleDrawerOpen = () => setMobileNavOpen(true)
   const handleDrawerClose = () => setMobileNavOpen(false)
   const handleDrawerToggle = () => setMobileNavOpen(!isMobileNavOpen)

   return (
      <React.Fragment>
         <Box sx={styles.root}>
            <TopBar
               links={mainLinks}
               currentGroup={currentGroup}
               onMobileNavOpen={handleDrawerOpen}
            />
            <NavBar
               drawerTopLinks={mainLinks}
               handleDrawerToggle={handleDrawerToggle}
               drawerWidth={theme.drawerWidth.medium}
               drawerBottomLinks={secondaryLinks}
               onMobileNavOpen={handleDrawerOpen}
               onMobileClose={handleDrawerClose}
               openMobile={isMobileNavOpen}
            />
            <Box sx={styles.wrapper}>
               <Box sx={styles.contentContainer}>
                  <Box sx={styles.content}>
                     {children}
                     <FooterV2 />
                  </Box>
               </Box>
            </Box>
         </Box>
      </React.Fragment>
   )
}

NextLivestreamsLayout.propTypes = {
   children: PropTypes.node.isRequired,
   firebase: PropTypes.object,
}

NextLivestreamsLayout.defaultProps = {}
export default NextLivestreamsLayout
