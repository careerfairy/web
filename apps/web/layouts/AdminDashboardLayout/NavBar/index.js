import React, { useEffect } from "react"
import PropTypes from "prop-types"
import { Box, Drawer, Hidden, List } from "@mui/material"
import { LogOut as LogoutIcon } from "react-feather"
import { useRouter } from "next/router"
import { alpha } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import clsx from "clsx"
import * as actions from "../../../store/actions"
import { compose } from "redux"
import { connect } from "react-redux"
import NavItem from "../../../components/views/navbar/NavItem"

const useStyles = makeStyles((theme) => ({
   mobileDrawer: {
      width: 256,
   },
   desktopDrawer: {
      width: 256,
      top: 64,
      height: "calc(100% - 64px)",
      boxShadow: theme.shadows[15],
   },
   avatar: {
      padding: theme.spacing(1),
      cursor: "pointer",
      background: theme.palette.common.white,
      height: 100,
      width: "100%",
      boxShadow: theme.shadows[15],
      "& img": {
         objectFit: "contain",
      },
   },
   background: {
      borderRight: "none",
      backgroundSize: "cover",
      backgroundPosition: "center center",
      background: `linear-gradient(0deg, ${alpha(
         theme.palette.common.black,
         0.7
      )}, ${alpha(theme.palette.common.black, 0.7)}), url(/sidebar.jpg)`,
   },
   name: {
      marginTop: theme.spacing(1),
   },
   drawerText: {
      color: theme.palette.common.white,
   },
}))

const NavBar = ({
   onMobileClose,
   openMobile,
   drawerTopLinks,
   headerLinks,
   drawerBottomLinks,
   logout,
}) => {
   const classes = useStyles()
   const { pathname } = useRouter()
   useEffect(() => {
      if (openMobile && onMobileClose) {
         onMobileClose()
      }
   }, [pathname])

   const signOut = () => {
      logout()
   }

   const content = (
      <Box height="100%" display="flex" flexDirection="column">
         <Box p={2}>
            <List>
               {drawerTopLinks.map((item) => (
                  <NavItem
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
                     <NavItem
                        href={item.href}
                        key={item.title}
                        title={item.title}
                     />
                  ))}
               </Hidden>
               {drawerBottomLinks.map((item) => (
                  <NavItem
                     href={item.href}
                     key={item.title}
                     title={item.title}
                     icon={item.icon}
                  />
               ))}
               <NavItem
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
         <Hidden lgUp>
            <Drawer
               anchor="left"
               classes={{
                  paper: clsx(classes.mobileDrawer, classes.background),
               }}
               onClose={onMobileClose}
               open={openMobile}
               variant="temporary"
            >
               {content}
            </Drawer>
         </Hidden>
         <Hidden lgDown>
            <Drawer
               anchor="left"
               classes={{
                  paper: clsx(classes.desktopDrawer, classes.background),
               }}
               open
               variant="persistent"
            >
               {content}
            </Drawer>
         </Hidden>
      </>
   )
}

NavBar.propTypes = {
   onMobileClose: PropTypes.func,
   openMobile: PropTypes.bool,
}

NavBar.defaultProps = {
   onMobileClose: () => {},
   openMobile: false,
}

const mapDispatchToProps = {
   logout: actions.signOut,
}

const enhance = compose(connect(null, mapDispatchToProps))

export default enhance(NavBar)
