import PropTypes from "prop-types"
import React, { useCallback, useState } from "react"
import NavBar from "./NavBar"
import { styles } from "../../materialUI/styles/layoutStyles/nextLivestreamsLayoutStyles"
import TopBar from "./TopBar"
import useGeneralLinks from "../../components/custom-hook/useGeneralLinks"
import Footer from "../../components/views/footer/Footer"
import { Box } from "@mui/material"
import Page from "../../components/views/common/Page"

const NextLivestreamsLayout = (props) => {
   const { children, currentGroup } = props

   const { mainLinks, secondaryLinks, eventLinks } = useGeneralLinks()

   const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
   const handleDrawerOpen = useCallback(() => setIsMobileNavOpen(true), [])
   const handleDrawerClose = useCallback(() => setIsMobileNavOpen(false), [])
   const handleDrawerToggle = useCallback(
      () => setIsMobileNavOpen(!isMobileNavOpen),
      [isMobileNavOpen]
   )

   return (
      <Page sx={{ backgroundColor: "white" }}>
         <TopBar
            links={mainLinks}
            currentGroup={currentGroup}
            onMobileNavOpen={handleDrawerOpen}
         />
         <NavBar
            drawerTopLinks={eventLinks}
            handleDrawerToggle={handleDrawerToggle}
            drawerBottomLinks={secondaryLinks}
            onMobileNavOpen={handleDrawerOpen}
            onMobileClose={handleDrawerClose}
            openMobile={isMobileNavOpen}
         />
         <Box sx={styles.wrapper}>
            <Box sx={styles.contentContainer}>
               <Box sx={styles.content}>
                  {children}
                  <Footer />
               </Box>
            </Box>
         </Box>
      </Page>
   )
}

NextLivestreamsLayout.propTypes = {
   children: PropTypes.node.isRequired,
   firebase: PropTypes.object,
}

NextLivestreamsLayout.defaultProps = {}
export default NextLivestreamsLayout
