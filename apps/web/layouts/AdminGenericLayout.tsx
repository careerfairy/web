import React, { memo, useEffect, useMemo } from "react"

// material-ui
import { AppBar, Box, Toolbar, useMediaQuery } from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import useScrollTrigger from "@mui/material/useScrollTrigger"
import Drawer from "@mui/material/Drawer"

// project imports
import useIsMobile from "../components/custom-hook/useIsMobile"
import {
   DRAWER_WIDTH,
   DRAWER_WIDTH_SHRUNK,
   NICE_SCROLLBAR_STYLES,
} from "../constants/layout"
import { sxStyles } from "../types/commonTypes"
import { useGenericDashboard } from "./GenericDashboardLayout"
import { useGroup } from "./GroupDashboardLayout"

const baseStyles = (drawerWidth: number) => {
   return sxStyles({
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
         width: `calc(100% - ${drawerWidth}px)`,
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
         backdropFilter: "blur(8px)",
         transition: (theme) =>
            theme.transitions.create([
               "backdrop-filter",
               "background-color",
               "width",
            ]),
      },
      toolbar: {
         backgroundColor: "none",
      },
      drawerWrapper: {
         flexShrink: { md: 0 },
      },
      drawer: {
         "& .MuiDrawer-paper": {
            width: drawerWidth,
            background: "white",
            borderRight: "none",
         },
         ...NICE_SCROLLBAR_STYLES,
      },
      drawerWrapperOpen: {
         width: {
            xs: "auto",
            md: drawerWidth,
         },
      },
      drawerWrapperClosed: {
         width: 0,
      },
      noBackdrop: {
         backdropFilter: "none",
         backgroundColor: "transparent",
      },
      topBarFixed: {
         position: "fixed",
      },
      borderBottom: {
         borderBottom: "2px solid rgba(0, 0, 0, 0.03)",
         backdropFilter: "blur(8px)",
      },
   })
}
// ==============================|| MAIN LAYOUT ||============================== //

const useStyles = () => {
   const { shrunkLeftMenuState, shrunkLeftMenuIsActive } = useGroup()

   let drawerWidth = DRAWER_WIDTH

   if (shrunkLeftMenuState !== "disabled") {
      drawerWidth = shrunkLeftMenuIsActive ? DRAWER_WIDTH_SHRUNK : DRAWER_WIDTH
   }

   return useMemo(() => baseStyles(drawerWidth), [drawerWidth])
}

type Props = {
   children: React.ReactNode
   drawerContent: React.ReactNode
   headerContent: React.ReactNode
   bottomNavContent?: JSX.Element
   dropdownNav?: JSX.Element
   drawerOpen: boolean
   setDrawer?: (open: boolean) => void
   toggleDrawer?: () => void
   bgColor?: string
   topBarTransparent?: boolean
   hideDrawer?: boolean
}
const AdminGenericLayout: React.FC<Props> = ({
   children,
   drawerContent,
   headerContent,
   bottomNavContent,
   dropdownNav,
   drawerOpen,
   setDrawer,
   toggleDrawer,
   bgColor,
   topBarTransparent = false,
   hideDrawer,
}) => {
   const theme = useTheme()
   const matchDownLg = useMediaQuery(theme.breakpoints.down("lg"))
   const isMobile = useIsMobile()
   const styles = useStyles()

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
         {hideDrawer ? null : (
            <DrawerComponent
               drawerOpen={drawerOpen}
               drawerToggle={toggleDrawer}
            >
               {drawerContent}
            </DrawerComponent>
         )}

         <Box
            sx={[
               styles.inner,
               styles.animateWidth,
               !isMobile && drawerOpen && styles.innerDesktop,
            ]}
         >
            {/* header */}
            <HeaderComponent topBarTransparent={topBarTransparent}>
               {headerContent}
            </HeaderComponent>

            {/* mobile dropdown navigation content*/}
            {dropdownNav}

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
   const styles = useStyles()

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
   children: React.ReactNode
   headerBgColor?: string
   topBarTransparent?: boolean
}
const HeaderComponent = ({
   children,
   headerBgColor = "#F7F8FC",
   topBarTransparent = false,
}: HeaderProps) => {
   const { topBarFixed, headerScrollThreshold } = useGenericDashboard()
   const styles = useStyles()

   const isScrolling = useScrollTrigger({
      disableHysteresis: true,
      threshold: headerScrollThreshold,
   })

   return (
      <AppBar
         enableColorOnDark
         position="sticky"
         color="inherit"
         elevation={0}
         sx={[
            styles.appBar,
            isScrolling ? styles.borderBottom : styles.noBackdrop,
            topBarFixed && styles.topBarFixed,
            isScrolling && {
               backgroundColor: alpha(headerBgColor, 0.9),
            },
            topBarTransparent && {
               backgroundColor: "transparent",
               borderBottom: "none",
               backdropFilter: "none",
            },
         ]}
      >
         <Toolbar sx={styles.toolbar} disableGutters>
            {children}
         </Toolbar>
      </AppBar>
   )
}

export default memo(AdminGenericLayout)
