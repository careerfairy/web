import React from "react"
import { Avatar, Box, Divider, Hidden, List, Typography } from "@mui/material"
import { LogOut as LogoutIcon } from "react-feather"
import * as actions from "../../../store/actions"
import { useDispatch } from "react-redux"
import NavElement from "../../../components/views/navbar/NavElement"
import { sxStyles } from "../../../types/commonTypes"
import { useAuth } from "../../../HOCs/AuthProvider"
import type { INavItem } from "../../../types/layout"
import { NavGroup, NavLink } from "../../common/NavElement"
import { useRouter } from "next/router"
import Stack from "@mui/material/Stack"
import Link from "../../../components/views/common/Link"
import useDashboardLinks from "../../../components/custom-hook/useDashboardLinks"
import { useGroup } from "../index"

const styles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   avatar: {
      padding: 1,
      cursor: "pointer",
      background: "white",
      width: "80%",
      height: 150,
      "& img": {
         objectFit: "contain",
      },
   },
   list: {
      width: "100%",
   },
   name: {
      marginTop: 1,
      whiteSpace: "pre-line",
   },
   description: {
      whiteSpace: "pre-line",
   },
})

const NavBar = () => {
   const { group } = useGroup()
   const { headerLinks, drawerTopLinks, drawerBottomLinks } =
      useDashboardLinks(group)
   const dispatch = useDispatch()
   const { isLoggedIn } = useAuth()
   const { pathname } = useRouter()

   const signOut = () => {
      dispatch(actions.signOut())
   }

   return (
      <Box sx={styles.root}>
         <Avatar
            component={Link}
            href={`/group/${group.id}/admin/edit`}
            sx={styles.avatar}
            src={group.logoUrl}
            variant="rounded"
         />
         <Stack sx={styles.list} spacing={3} component={List}>
            {mainLinks.map((navItem) =>
               navItem.type === "collapse" ? (
                  <NavGroup key={navItem.id} item={navItem} />
               ) : (
                  <NavLink
                     isActive={pathname === navItem.pathName}
                     key={navItem.id}
                     item={navItem}
                  />
               )
            )}
         </Stack>
      </Box>
   )

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
