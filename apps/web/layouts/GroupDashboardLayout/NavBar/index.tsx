import React from "react"
import { Avatar, Box, Divider, Hidden, List, Typography } from "@mui/material"
import { LogOut as LogoutIcon } from "react-feather"
import * as actions from "../../../store/actions"
import { useDispatch } from "react-redux"
import NavElement from "../../../components/views/navbar/NavElement"
import { StylesProps } from "../../../types/commonTypes"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import { PageLinkProps } from "../../../components/custom-hook/useGeneralLinks"
import { useAuth } from "../../../HOCs/AuthProvider"

const styles: StylesProps = {
   avatar: {
      padding: 1,
      cursor: "pointer",
      background: "white",
      height: 100,
      width: "100%",
      "& img": {
         objectFit: "contain",
      },
   },
   name: {
      marginTop: 1,
      whiteSpace: "pre-line",
   },
   description: {
      whiteSpace: "pre-line",
   },
}

interface Props {
   group: Group
   drawerTopLinks: PageLinkProps[]
   headerLinks: PageLinkProps[]
   drawerBottomLinks: PageLinkProps[]
}
const NavBar = ({
   group,
   drawerTopLinks,
   headerLinks,
   drawerBottomLinks,
}: Props) => {
   const dispatch = useDispatch()
   const { isLoggedIn } = useAuth()

   const signOut = () => {
      dispatch(actions.signOut())
   }

   if (!group) {
      return null
   }

   return (
      <Box height="100%" display="flex" flexDirection="column">
         <Box alignItems="center" display="flex" flexDirection="column" p={2}>
            <Avatar sx={styles.avatar} src={group.logoUrl} variant="rounded" />
            <Typography
               align={"center"}
               sx={[styles.name]}
               color="textPrimary"
               variant="h5"
            >
               {group.universityName}
            </Typography>
            <Typography
               align={"center"}
               sx={styles.description}
               color="textSecondary"
               variant="body2"
            >
               {group.description}
            </Typography>
         </Box>
         <Divider />
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
               {isLoggedIn && (
                  <NavElement
                     href=""
                     onClick={signOut}
                     icon={LogoutIcon}
                     title="LOGOUT"
                  />
               )}
            </List>
         </Box>
      </Box>
   )
}

export default NavBar
