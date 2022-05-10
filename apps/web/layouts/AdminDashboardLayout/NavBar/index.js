import React from "react"
import { Box, Hidden, List } from "@mui/material"
import { LogOut as LogoutIcon } from "react-feather"
import * as actions from "../../../store/actions"
import { useDispatch } from "react-redux"
import PersistentGenericDrawer from "../../../components/views/navbar/PersistentGenericDrawer"
import NavElement from "../../../components/views/navbar/NavElement"

const NavBar = ({
   drawerTopLinks,
   headerLinks,
   drawerBottomLinks,
   isDesktop,
}) => {
   const dispatch = useDispatch()

   const signOut = () => {
      dispatch(actions.signOut())
   }

   const content = (
      <Box height="100%" display="flex" flexDirection="column">
         <Box p={2}>
            <List>
               {drawerTopLinks.map((item) => (
                  <NavElement {...item} key={item.title} />
               ))}
            </List>
         </Box>
         <Box flexGrow={1} />
         <Box p={2}>
            <List>
               <Hidden lgUp>
                  {headerLinks.map((item) => (
                     <NavElement {...item} key={item.title} />
                  ))}
               </Hidden>
               {drawerBottomLinks.map((item) => (
                  <NavElement {...item} key={item.title} />
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
      <PersistentGenericDrawer isPersistent={isDesktop}>
         {content}
      </PersistentGenericDrawer>
   )
}

export default NavBar
