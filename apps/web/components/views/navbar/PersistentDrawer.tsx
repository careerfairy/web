import React, { useEffect } from "react"
import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import Divider from "@mui/material/Divider"
import Drawer from "@mui/material/Drawer"
import Hidden from "@mui/material/Hidden"
import List from "@mui/material/List"
import Typography from "@mui/material/Typography"
import { LogOut as LogoutIcon } from "react-feather"
import { useRouter } from "next/router"
import { useTheme } from "@mui/material/styles"
import * as actions from "../../../store/actions"
import { useDispatch, useSelector } from "react-redux"
import { useAuth } from "../../../HOCs/AuthProvider"
import { stringAvatar } from "../../../util/CommonUtil"
import NavElement from "./NavElement"
import { StylesProps } from "../../../types/commonTypes"
import RootState from "../../../store/reducers"
import { useMediaQuery } from "@mui/material"

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
      transition: (theme) =>
         theme.transitions.create(["width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
         }),
      "& > .MuiDrawer-paper": {
         boxSizing: "border-box",
         top: 64,
         height: "calc(100% - 64px)",
         transition: "inherit",
      },
   },
   avatar: {
      padding: 1,
      cursor: "pointer",
      background: "white",
      height: 100,
      width: "100%",
      boxShadow: 15,
      "& img": {
         objectFit: "contain",
      },
   },
   name: {
      marginTop: 1,
   },
   drawerText: {
      color: "white",
   },
}

interface PersistentDrawerProps {
   drawerTopLinks: any[]
   headerLinks: any[]
   drawerBottomLinks: any[]
}

const PersistentDrawer = ({
   drawerTopLinks,
   headerLinks,
   drawerBottomLinks,
}: PersistentDrawerProps) => {
   const { userData } = useAuth()
   const dispatch = useDispatch()
   const theme = useTheme()
   const isDesktop = useMediaQuery(theme.breakpoints.up(desktopProp))

   const { pathname } = useRouter()
   const drawerOpen = useSelector(
      (state: RootState) => state.generalLayout.layout.drawerOpen
   )
   useEffect(() => {
      if (drawerOpen) {
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
            <Avatar
               sx={styles.avatar}
               {...stringAvatar(`${userData?.firstName} ${userData?.lastName}`)}
               variant="rounded"
            />
            <Typography
               sx={[styles.name, styles.drawerText]}
               color="textPrimary"
               variant="h5"
            >
               SUB NAME
            </Typography>
            <Typography
               color="textSecondary"
               variant="body2"
               sx={styles.drawerText}
            >
               DESC
            </Typography>
         </Box>
         <Divider />
         <Box p={2}>
            <List>
               {drawerTopLinks.map((item) => (
                  <NavElement
                     href={item.href}
                     key={item.title}
                     title={item.title}
                     icon={item.icon}
                     basePath={item.basePath}
                  />
               ))}
            </List>
         </Box>
         <Box flexGrow={1} />
         <Box p={2}>
            <List>
               <Hidden lgUp>
                  {headerLinks.map((item) => (
                     <NavElement
                        href={item.href}
                        key={item.title}
                        title={item.title}
                     />
                  ))}
               </Hidden>
               {drawerBottomLinks.map((item) => (
                  <NavElement
                     href={item.href}
                     key={item.title}
                     title={item.title}
                     icon={item.icon}
                  />
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
                  styles.persistentDrawer,
                  drawerOpen ? styles.drawerOpen : styles.drawerClosed,
               ]}
               open
               PaperProps={{
                  sx: [drawerOpen ? styles.drawerOpen : styles.drawerClosed],
               }}
               variant="persistent"
            >
               DESKTOP
               {content}
            </Drawer>
         ) : (
            <Drawer
               anchor="left"
               sx={styles.tempDrawer}
               onClose={closeDrawer}
               open={drawerOpen}
               variant="temporary"
            >
               MOBILE
               {content}
            </Drawer>
         )}
      </>
   )
}

export default PersistentDrawer
