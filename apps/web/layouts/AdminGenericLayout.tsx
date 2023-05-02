import React, { memo, useEffect } from "react"

// material-ui
import { AppBar, Box, Toolbar, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import useScrollTrigger from "@mui/material/useScrollTrigger"
import Drawer from "@mui/material/Drawer"

// project imports
import useIsMobile from "../components/custom-hook/useIsMobile"
import { DRAWER_WIDTH, NICE_SCROLLBAR_STYLES } from "../constants/layout"
import { sxStyles } from "../types/commonTypes"
import { useGenericDashboard } from "./GenericDashboardLayout"

const styles = sxStyles({
   root: {
      display: "flex",
      minHeight: "100vh",
   },
   inner: {
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      maxWidth: "fill-available",
   },
   innerDesktop: {
      width: `calc(100% - ${DRAWER_WIDTH}px)`,
   },
   main: {
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
   },
   animateWidth: {
      transition: (theme) => theme.transitions.create("width"),
   },
   appBar: {
      bgcolor: "transparent",
      backdropFilter: "blur(8px)",
      transition: (theme) => theme.transitions.create("backdrop-filter"),
   },
   toolbar: {
      backgroundColor: "none",
   },
   drawerWrapper: {
      flexShrink: { md: 0 },
   },
   drawer: {
      "& .MuiDrawer-paper": {
         width: DRAWER_WIDTH,
         background: "white",
         borderRight: "none",
      },
      ...NICE_SCROLLBAR_STYLES,
   },
   drawerWrapperOpen: {
      width: {
         xs: "auto",
         md: DRAWER_WIDTH,
      },
   },
   drawerWrapperClosed: {
      width: 0,
   },
   noBackdrop: {
      backdropFilter: "none",
   },
   topBarFixed: {
      position: "fixed",
   },
})

// ==============================|| MAIN LAYOUT ||============================== //

type Props = {
   children: React.ReactNode
   drawerContent: React.ReactNode
   headerContent: React.ReactNode
   bottomNavContent?: JSX.Element
   drawerOpen: boolean
   setDrawer?: (open: boolean) => void
   toggleDrawer?: () => void
   bgColor?: string
}
const AdminGenericLayout: React.FC<Props> = ({
   children,
   drawerContent,
   headerContent,
   bottomNavContent,
   drawerOpen,
   setDrawer,
   toggleDrawer,
   bgColor,
}) => {
   const theme = useTheme()
   const matchDownLg = useMediaQuery(theme.breakpoints.down("lg"))
   const isMobile = useIsMobile()

   useEffect(() => {
      // Dynamically set drawerOpen based on screen size
      setDrawer?.(!matchDownLg)
   }, [matchDownLg, setDrawer])

   return (
      <Box
         sx={[
            styles.root,
            {
               bgcolor: bgColor ? bgColor : "background.default",
            },
         ]}
      >
         {/* drawer */}
         <DrawerComponent drawerOpen={drawerOpen} drawerToggle={toggleDrawer}>
            {drawerContent}
         </DrawerComponent>

         <Box
            sx={[
               styles.inner,
               styles.animateWidth,
               !isMobile && drawerOpen && styles.innerDesktop,
            ]}
         >
            {/* header */}
            <HeaderComponent drawerOpen={drawerOpen}>
               {headerContent}
            </HeaderComponent>
            {/* main content */}
            <Box
               component={"main"}
               sx={[
                  styles.main,
                  { mb: isMobile && bottomNavContent ? "50px" : "" },
               ]}
            >
               {children}
            </Box>
            {/* Bottom navigation bar */}
            {isMobile && bottomNavContent ? bottomNavContent : null}
         </Box>
      </Box>
   )
}

type DrawerProps = {
   drawerOpen: boolean
   drawerToggle: () => void
   children: React.ReactNode
}
const DrawerComponent = ({
   drawerOpen,
   drawerToggle,
   children,
}: DrawerProps) => {
   const isMobile = useIsMobile()
   return (
      <Box
         component="nav"
         sx={[
            styles.drawerWrapper,
            styles.animateWidth,
            drawerOpen ? styles.drawerWrapperOpen : styles.drawerWrapperClosed,
         ]}
         aria-label="page links"
      >
         <Drawer
            variant={isMobile ? "temporary" : "persistent"}
            anchor="left"
            open={drawerOpen}
            onClose={drawerToggle}
            sx={styles.drawer}
            ModalProps={{ keepMounted: true }}
         >
            {children}
         </Drawer>
      </Box>
   )
}

type HeaderProps = {
   drawerOpen: boolean
   children: React.ReactNode
}
const HeaderComponent = ({ drawerOpen, children }: HeaderProps) => {
   const { topBarFixed } = useGenericDashboard()
   const isScrolling = useScrollTrigger({
      disableHysteresis: true,
      threshold: 10,
   })

   return (
      <AppBar
         enableColorOnDark
         position="sticky"
         color="inherit"
         elevation={0}
         sx={[
            styles.appBar,
            drawerOpen && styles.animateWidth,
            !isScrolling && styles.noBackdrop,
            topBarFixed && styles.topBarFixed,
         ]}
      >
         <Toolbar sx={styles.toolbar} disableGutters>
            {children}
         </Toolbar>
      </AppBar>
   )
}

export default memo(AdminGenericLayout)
