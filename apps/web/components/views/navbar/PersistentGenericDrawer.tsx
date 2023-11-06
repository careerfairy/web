import React, { FC, useEffect } from "react"
import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import { useRouter } from "next/router"
import * as actions from "../../../store/actions"
import { useDispatch, useSelector } from "react-redux"
import { StylesProps } from "../../../types/commonTypes"
import { RootState } from "../../../store"
import { MainLogo } from "../../logos"
import { SxProps } from "@mui/material"
import { DefaultTheme } from "@mui/styles/defaultTheme"

const styles: StylesProps = {
   tempDrawer: {
      zIndex: (theme) => theme.zIndex.drawer + 1,
      "& > .MuiDrawer-paper": {
         width: (theme) => theme.drawerWidth.small,
      },
   },
   drawerOpen: {
      width: (theme) => theme.drawerWidth.small,
      borderRadius: 0,
   },
   drawerClosed: {
      width: 0,
   },
   drawerAnimation: {
      transition: (theme) => theme.transitions.create("width"),
      "& > .MuiDrawer-paper": {
         transition: (theme) =>
            `${theme.transitions.create([
               "width",
               "top",
               "height",
            ])} !important`,
      },
   },
   persistentDrawer: {
      width: (theme) => theme.drawerWidth.small,
      flexShrink: 0,
      zIndex: (theme) => theme.zIndex.drawer + 1,
      "& > .MuiDrawer-paper": {
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
   isPersistent: boolean
   sx?: SxProps<DefaultTheme>
   children: React.ReactNode
}

/**
 * Some pages have tabs that don't look great with the animation
 * Disable the slide animation for these paths
 */
const disableAnimationForPaths = [/^\/profile/]

const PersistentGenericDrawer: FC<PersistentDrawerProps> = ({
   isPersistent,
   children,
   sx,
}) => {
   const dispatch = useDispatch()

   const { pathname } = useRouter()
   const drawerOpen = useSelector(
      (state: RootState) => state.generalLayout.layout.drawerOpen
   )
   useEffect(() => {
      if (drawerOpen && !isPersistent) {
         closeDrawer()
      }

      return () => {
         closeDrawer()
      }
   }, [pathname, isPersistent])

   useEffect(() => {
      if (isPersistent) {
         openDrawer()
      }
   }, [isPersistent])

   const closeDrawer = () => {
      dispatch(actions.closeNavDrawer())
   }
   const openDrawer = () => {
      dispatch(actions.openNavDrawer())
   }

   const sxProps = [
      styles.drawer,
      styles.persistentDrawer,
      drawerOpen ? styles.drawerOpen : styles.drawerClosed,
      ...(Array.isArray(sx) ? sx : [sx]),
   ]

   if (canShowAnimationForPath(pathname)) {
      sxProps.push(styles.drawerAnimation)
   }

   return isPersistent ? (
      <Drawer
         anchor="left"
         sx={sxProps}
         open
         PaperProps={{
            sx: [drawerOpen ? styles.drawerOpen : styles.drawerClosed],
         }}
         variant="persistent"
      >
         {children}
      </Drawer>
   ) : (
      <Drawer
         anchor="left"
         sx={[
            styles.drawer,
            styles.tempDrawer,
            ...(Array.isArray(sx) ? sx : [sx]),
         ]}
         PaperProps={{
            sx: {
               borderRadius: 0,
            },
         }}
         onClose={closeDrawer}
         open={drawerOpen}
         variant="temporary"
      >
         <Box sx={styles.logoWrapper}>
            <MainLogo />
         </Box>
         {children}
      </Drawer>
   )
}

const canShowAnimationForPath = (pathName: string) => {
   return !disableAnimationForPaths.some((path) => path.test(pathName))
}

export default PersistentGenericDrawer
