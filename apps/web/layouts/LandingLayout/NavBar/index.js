import React, { memo, useEffect } from "react"
import Drawer from "@mui/material/Drawer"
import List from "@mui/material/List"
import Divider from "@mui/material/Divider"
import ListItem from "@mui/material/ListItem"
import { Box, Button } from "@mui/material"
import { useAuth } from "../../../HOCs/AuthProvider"
import NavItem from "../../../components/views/navbar/NavItem"
import { LogOut as LogoutIcon } from "react-feather"
import { useDispatch, useSelector } from "react-redux"
import * as actions from "../../../store/actions"
import Link from "../../../materialUI/NextNavLink"
import useGeneralLinks from "../../../components/custom-hook/useGeneralLinks"
import PropTypes from "prop-types"

function LoginButton() {
   return (
      <ListItem>
         <Button
            fullWidth
            sx={{
               color: "white !important",
            }}
            component={Link}
            href="/login"
            style={{ textDecoration: "none" }}
            color="primary"
            variant="contained"
         >
            Login
         </Button>
      </ListItem>
   )
}

const NavBar = memo(({ drawerWidth, anchor = "left" }) => {
   const { userData, authenticatedUser, isLoggedOut } = useAuth()
   const dispatch = useDispatch()
   const signOut = () => dispatch(actions.signOut())
   const { secondaryLinks, mainLinks } = useGeneralLinks()
   const openMobile = useSelector(
      (state) => state.generalLayout.layout.drawerOpen
   )
   const handleDrawerClose = () => dispatch(actions.closeNavDrawer())

   useEffect(() => {
      return () => handleDrawerClose()
   }, [])

   const content = (
      <Box height="100%" display="flex" flexDirection="column">
         <Box p={2}>
            <List>
               {authenticatedUser.isLoaded && authenticatedUser.isEmpty && (
                  <LoginButton />
               )}
               {mainLinks.map(({ title, href, icon }) => (
                  <NavItem
                     href={href}
                     key={title}
                     title={title}
                     icon={icon}
                     black
                  />
               ))}
               <Divider />
            </List>
         </Box>
         <Box flexGrow={1} />
         <Box p={2}>
            <List>
               <Divider />
               {secondaryLinks.map((item) => (
                  <NavItem
                     href={item.href}
                     key={item.title}
                     title={item.title}
                     icon={item.icon}
                     black
                  />
               ))}
               {!isLoggedOut && (
                  <NavItem
                     href="#"
                     onClick={signOut}
                     icon={LogoutIcon}
                     title="LOGOUT"
                     black
                  />
               )}
            </List>
         </Box>
      </Box>
   )

   return (
      <Drawer
         anchor={anchor}
         PaperProps={{
            sx: {
               width: drawerWidth || "256px",
               borderRight: "none",
               backgroundSize: "cover",
               backgroundPosition: "center center",
               // background: `linear-gradient(0deg, ${alpha(theme.palette.common.black, 0.3)}, ${alpha(theme.palette.common.black, 0.3)}), url(/next-livestreams-side.jpg)`,
            },
         }}
         sx={{
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
         }}
         onClose={handleDrawerClose}
         open={openMobile}
         variant="temporary"
      >
         {content}
      </Drawer>
   )
})

NavBar.propTypes = {
   anchor: PropTypes.oneOf(["left", "right"]),
}

export default NavBar
