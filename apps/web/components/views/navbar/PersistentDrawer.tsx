import React, { useEffect } from "react"
import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import { useRouter } from "next/router"
import * as actions from "../../../store/actions"
import { useDispatch, useSelector } from "react-redux"
import { StylesProps } from "../../../types/commonTypes"
import RootState from "../../../store/reducers"
import { MainLogo } from "../../logos"
import DrawerContent from "./DrawerContent"

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
   isDesktop: boolean
}

const PersistentDrawer = ({ isDesktop }: PersistentDrawerProps) => {
   const dispatch = useDispatch()

   const { pathname } = useRouter()
   const drawerOpen = useSelector(
      (state: RootState) => state.generalLayout.layout.drawerOpen
   )
   useEffect(() => {
      if (drawerOpen && !isDesktop) {
         closeDrawer()
      }

      return () => {
         closeDrawer()
      }
   }, [pathname, isDesktop])

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

   return isDesktop ? (
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
         <DrawerContent isDesktop={isDesktop} />
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
         <DrawerContent />
      </Drawer>
   )
}

export default PersistentDrawer
