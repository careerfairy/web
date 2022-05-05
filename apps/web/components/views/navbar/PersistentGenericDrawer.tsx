import React, { FC, useEffect } from "react"
import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import { useRouter } from "next/router"
import * as actions from "../../../store/actions"
import { useDispatch, useSelector } from "react-redux"
import { StylesProps } from "../../../types/commonTypes"
import RootState from "../../../store/reducers"
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
            `${theme.transitions.create([
               "width",
               "top",
               "height",
            ])} !important`,
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
}

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

   return isPersistent ? (
      <Drawer
         anchor="left"
         sx={[
            styles.drawer,
            styles.persistentDrawer,
            drawerOpen ? styles.drawerOpen : styles.drawerClosed,
            ...(Array.isArray(sx) ? sx : [sx]),
         ]}
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

export default PersistentGenericDrawer
