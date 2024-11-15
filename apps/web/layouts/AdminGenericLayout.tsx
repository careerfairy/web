import React, { memo, useEffect, useMemo } from "react"

// material-ui
import {
   AppBar,
   Box,
   Drawer,
   Slide,
   Toolbar,
   useMediaQuery,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import useScrollTrigger from "@mui/material/useScrollTrigger"

// project imports
import useSparksFeedIsFullScreen from "components/views/sparks-feed/hooks/useSparksFeedIsFullScreen"
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
      header: {
         backgroundColor: "unset",
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
   bottomNavContent?: JSX.Element | React.ReactNode
   showBottomNavContent?: boolean
   dropdownNav?: JSX.Element
   drawerOpen: boolean
   setDrawer?: (open: boolean) => void
   toggleDrawer?: () => void
   bgColor?: string
   hideHeader?: boolean
   hideDrawer?: boolean
   headerWidth?: string
}

const AdminGenericLayout: React.FC<Props> = ({
   children,
   drawerContent,
   headerContent,
   bottomNavContent,
   showBottomNavContent,
   dropdownNav,
   drawerOpen,
   setDrawer,
   toggleDrawer,
   bgColor,
   hideHeader = false,
   hideDrawer,
   headerWidth,
}) => {
   const theme = useTheme()
   const matchDownLg = useMediaQuery(theme.breakpoints.down("lg"))
   const isMobile = useIsMobile()
   const isFullScreen = useSparksFeedIsFullScreen()
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
            {hideHeader ? null : (
               <HeaderComponent width={headerWidth}>
                  {headerContent}
               </HeaderComponent>
            )}

            {/* mobile dropdown navigation content*/}
            {dropdownNav}

            {/* main content */}
            <Box component={"main"} sx={styles.main}>
               {children}
            </Box>
            {/* Bottom navigation bar */}
            {(isMobile || isFullScreen || showBottomNavContent) &&
            bottomNavContent
               ? bottomNavContent
               : null}
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
   width?: string
}
const HeaderComponent = ({ children, width }: HeaderProps) => {
   const { headerScrollThreshold, headerFixed } = useGenericDashboard()
   const isMobile = useIsMobile()
   const styles = useStyles()

   const isScrolling = useScrollTrigger({
      threshold: headerScrollThreshold,
   })

   return (
      <Slide
         appear={false}
         direction="down"
         in={isMobile ? headerFixed || !isScrolling : true}
      >
         <AppBar
            enableColorOnDark
            position="sticky"
            color="inherit"
            elevation={0}
            sx={[width && { width }, styles.header]}
         >
            <Toolbar sx={styles.header} disableGutters>
               {children}
            </Toolbar>
         </AppBar>
      </Slide>
   )
}

export default memo(AdminGenericLayout)
