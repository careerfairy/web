import React from "react"
import Box from "@mui/material/Box"
import List from "@mui/material/List"
import NavElement from "./NavElement"
import { LogOut as LogoutIcon } from "react-feather"
import useGeneralLinks from "../../custom-hook/useGeneralLinks"
import { useAuth } from "../../../HOCs/AuthProvider"
import LoginButton from "../common/LoginButton"
import { useDispatch } from "react-redux"
import * as actions from "../../../store/actions"
import NavPrompt from "../common/NavPrompt"
import Stack from "@mui/material/Stack"
import { StylesProps } from "../../../types/commonTypes"
import { Divider, ListItem } from "@mui/material"
import UserAvatarAndDetails from "../common/UserAvatarAndDetails"

const styles: StylesProps = {
   root: {
      height: "100%",
      p: 2,
   },
}
const DrawerContent = () => {
   const {
      authenticatedUserBottomLinks,
      authenticatedUserTopLinks,
      eventLinks,
   } = useGeneralLinks()
   const { isLoggedOut, authenticatedUser, isLoggedIn, userData } = useAuth()
   const dispatch = useDispatch()
   const signOut = () => dispatch(actions.signOut())

   return (
      <Stack divider={<Divider flexItem />} sx={styles.root} spacing={1}>
         {isLoggedIn && userData && <UserAvatarAndDetails />}
         <Stack spacing={1}>
            <List>
               {isLoggedOut && (
                  <ListItem>
                     <LoginButton />
                  </ListItem>
               )}
               {eventLinks.map((item) => (
                  <NavElement key={item.title} {...item} />
               ))}
            </List>
         </Stack>
         {isLoggedIn && (
            <>
               <List>
                  {authenticatedUserTopLinks.map((item) => (
                     <NavElement key={item.title} {...item} />
                  ))}
               </List>
            </>
         )}

         {isLoggedOut && <NavPrompt />}
         <Box sx={{ mt: "auto !important" }}>
            <List>
               {authenticatedUserBottomLinks.map((item) => (
                  <NavElement key={item.title} {...item} />
               ))}
               {authenticatedUser.isLoaded && !authenticatedUser.isEmpty && (
                  <NavElement
                     href=""
                     onClick={signOut}
                     icon={LogoutIcon}
                     title="LOGOUT"
                  />
               )}
            </List>
         </Box>
      </Stack>
   )
}

export default DrawerContent
