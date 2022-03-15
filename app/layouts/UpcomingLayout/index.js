import React from "react"
import { styles as landingLayoutStyles } from "../../materialUI/styles/layoutStyles/landingLayoutStyles"
import { useTheme } from "@mui/material/styles"
import TopBar from "./TopBar"
import NavBar from "./NavBar"
import FooterV2 from "../../components/views/footer/FooterV2"
import { Box } from "@mui/material"

const layoutStyles = landingLayoutStyles({})
const styles = {
   ...layoutStyles,
   root: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
   },
   wrapper: (theme) => ({
      ...layoutStyles.wrapper(theme),
      overflow: "visible",
      paddingTop: "0 !important",
   }),
   contentContainer: {
      ...layoutStyles.contentContainer,
      overflow: "visible",
   },
   content: {
      ...layoutStyles.content,
      overflow: "visible",
      overflowX: "visible",
   },
}

const drawerWidth = 300
const UpcomingLayout = ({ children }) => {
   const theme = useTheme()
   return (
      <Box sx={styles.root}>
         <TopBar />
         <NavBar anchor="left" drawerWidth={drawerWidth} />
         <Box sx={styles.wrapper}>
            <Box sx={styles.contentContainer}>
               <Box sx={styles.content}>
                  {children}
                  <FooterV2 background={theme.palette.common.white} />
               </Box>
            </Box>
         </Box>
      </Box>
   )
}

export default UpcomingLayout
