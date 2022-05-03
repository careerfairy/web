import React, { useEffect } from "react"
import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import List from "@mui/material/List"
import { LogOut as LogoutIcon } from "react-feather"
import { useRouter } from "next/router"
import { useTheme } from "@mui/material/styles"
import * as actions from "../../../store/actions"
import { useDispatch, useSelector } from "react-redux"
import NavElement from "./NavElement"
import { StylesProps } from "../../../types/commonTypes"
import RootState from "../../../store/reducers"
import { useMediaQuery } from "@mui/material"
import { MainLogo } from "../../logos"
import UserAvatarAndDetails from "../../../layouts/UserLayout/UserAvatarAndDetails"

const desktopProp = "md"

const styles: StylesProps = {
   tempDrawer: {
      zIndex: (theme) => theme.zIndex.drawer + 1,
      "& > .MuiDrawer-paper": {
         width: (theme) => theme.drawerWidth.small,
      },
   },
   drawerOpen: {
      width: (theme) => theme.drawerWidth.small,
   },
   drawerClosed: {
      width: 0,
   },
   persistentDrawer: {
      width: (theme) => theme.drawerWidth.small,
      flexShrink: 0,
      zIndex: (theme) => theme.zIndex.drawer + 1,
      transition: (theme) => theme.transitions.create("width"),
      "& > .MuiDrawer-paper": {
         transition: (theme) =>
            `${theme.transitions.create("width")} !important`,
         boxSizing: "border-box",
         top: 64,
         height: "calc(100% - 64px)",
      },
   },

   name: {
      marginTop: 1,
   },
   drawerText: {
      color: "white",
   },
   logoWrapper: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      py: 2,
   },
   drawer: {
      flexShrink: 0,
      whiteSpace: "nowrap",
      "& ::-webkit-scrollbar": {
         width: "3px",
         backgroundColor: "transparent",
      },
      "& ::-webkit-scrollbar-thumb": {
         borderRadius: "10px",
         WebkitBoxShadow: "inset 0 0 6px rgba(0,0,0,.3)",
         backgroundColor: "secondary.light",
      },
   },
}

interface PersistentDrawerProps {
   drawerTopLinks: any[]
   drawerBottomLinks: any[]
}

const PersistentDrawer = ({
   drawerTopLinks,
   drawerBottomLinks,
}: PersistentDrawerProps) => {
   const dispatch = useDispatch()
   const theme = useTheme()

   const isDesktop = useMediaQuery(theme.breakpoints.up(desktopProp), {
      noSsr: true,
   })

   const { pathname } = useRouter()
   const drawerOpen = useSelector(
      (state: RootState) => state.generalLayout.layout.drawerOpen
   )
   useEffect(() => {
      if (drawerOpen && !isDesktop) {
         closeDrawer()
      }
   }, [pathname])

   useEffect(() => {
      if (isDesktop) {
         openDrawer()
      }
   }, [isDesktop])

   const closeDrawer = () => {
      dispatch(actions.closeNavDrawer())
   }
   const openDrawer = () => {
      dispatch(actions.openNavDrawer())
   }

   const signOut = () => {
      dispatch(actions.signOut())
   }

   const content = (
      <Box height="100%" display="flex" flexDirection="column">
         <Box alignItems="center" display="flex" flexDirection="column" p={2}>
            <UserAvatarAndDetails />
         </Box>
         <Box p={2}>
            <List>
               {drawerTopLinks.map((item) => (
                  <NavElement key={item.title} {...item} />
               ))}
            </List>
         </Box>
         <Box flexGrow={1} />
         <Box p={2}>
            <List>
               {drawerBottomLinks.map((item) => (
                  <NavElement key={item.title} {...item} />
               ))}
               <NavElement
                  href=""
                  onClick={signOut}
                  icon={LogoutIcon}
                  title="LOGOUT"
               />
            </List>
         </Box>
      </Box>
   )

   return (
      <>
         {isDesktop ? (
            <Drawer
               anchor="left"
               sx={[
                  styles.drawer,
                  styles.persistentDrawer,
                  drawerOpen ? styles.drawerOpen : styles.drawerClosed,
               ]}
               open
               PaperProps={{
                  sx: [drawerOpen ? styles.drawerOpen : styles.drawerClosed],
               }}
               variant="persistent"
            >
               {content}
            </Drawer>
         ) : (
            <Drawer
               anchor="left"
               sx={[styles.drawer, styles.tempDrawer]}
               onClose={closeDrawer}
               open={drawerOpen}
               variant="temporary"
            >
               <Box sx={styles.logoWrapper}>
                  <MainLogo />
               </Box>
               {content}
            </Drawer>
         )}
      </>
   )
}

export default PersistentDrawer
