import React, { FC, memo, useEffect } from "react"
import Drawer from "@mui/material/Drawer"
import { useDispatch, useSelector } from "react-redux"
import * as actions from "../../../store/actions"
import RootState from "../../../store/reducers"
import { StylesProps } from "../../../types/commonTypes"
import DrawerContent from "./DrawerContent"

const styles: StylesProps = {
   paperStyles: {
      width: (theme) => theme.drawerWidth.small,
   },
   name: {
      marginTop: 1,
   },
   drawerText: {
      color: "white",
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
         backgroundColor: "#555",
      },
   },

   loginButton: {
      color: "white !important",
   },
}

const GenericDrawer: FC = ({ children }) => {
   const dispatch = useDispatch()
   const openMobile = useSelector(
      (state: RootState) => state.generalLayout.layout.drawerOpen
   )
   const handleDrawerClose = () => dispatch(actions.closeNavDrawer())

   // @ts-ignore
   useEffect(() => {
      return () => handleDrawerClose()
   }, [])

   return (
      <Drawer
         anchor="left"
         PaperProps={{
            sx: styles.paperStyles,
         }}
         sx={styles.drawer}
         onClose={handleDrawerClose}
         open={openMobile}
         variant="temporary"
      >
         {children}
      </Drawer>
   )
}

export default GenericDrawer
