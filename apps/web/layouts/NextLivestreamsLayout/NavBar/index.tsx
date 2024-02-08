import React, { memo, useEffect, useState } from "react"
import Drawer from "@mui/material/Drawer"
import List from "@mui/material/List"
import Divider from "@mui/material/Divider"
import ListItem from "@mui/material/ListItem"
import { Box, CircularProgress, Hidden } from "@mui/material"
import { useAuth } from "../../../HOCs/AuthProvider"
import { useRouter } from "next/router"
import {
   getResizedUrl,
   repositionElementInArray,
} from "../../../components/helperFunctions/HelperFunctions"
import NavElement from "../../../components/views/navbar/NavElement"
import { LogOut as LogoutIcon } from "react-feather"
import { useDispatch } from "react-redux"
import * as actions from "../../../store/actions"
import GroupNavLink from "./groupNavLink"
import NavPrompt from "../../../components/views/common/NavPrompt"
import useFollowingGroups from "../../../components/custom-hook/useFollowingGroups"
import LoginButtonComponent from "components/views/common/LoginButton"
import { StylesProps } from "../../../types/commonTypes"
import { PageLinkProps } from "../../../components/custom-hook/useGeneralLinks"
import Stack from "@mui/material/Stack"
import { registerIllustrationSvg } from "../../../constants/images"

const styles: StylesProps = {
   root: {
      height: "100%",
      p: 2,
      display: "flex",
      flexDirection: "column",
   },
   mobileDrawer: {
      width: (theme) => theme.legacy.drawerWidth.small,
   },
   desktopDrawer: {
      width: (theme) => theme.legacy.drawerWidth.small,
      top: 64,
      height: "calc(100% - 64px)",
      boxShadow: 1,
   },
   background: {
      borderRight: "none",
      backgroundSize: "cover",
      backgroundPosition: "center center",
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
}

function LoginButton() {
   return (
      <ListItem>
         <LoginButtonComponent />
      </ListItem>
   )
}

interface FeedDrawerProps {
   onMobileClose: () => void
   openMobile: boolean
   drawerBottomLinks: PageLinkProps[]
   drawerTopLinks: PageLinkProps[]
}

const FeedDrawer = memo(
   ({
      onMobileClose,
      openMobile,
      drawerBottomLinks,
      drawerTopLinks,
   }: FeedDrawerProps) => {
      const {
         query: { groupId: groupIdInQuery },
      } = useRouter()
      const { userData, isLoggedOut, isLoggedIn } = useAuth()
      const [groups, setGroups] = useState(null)
      const dispatch = useDispatch()
      const signOut = () => dispatch(actions.signOut())
      const [followingGroups, loading] = useFollowingGroups()

      useEffect(() => {
         if (userData) {
            let newGroups = [...followingGroups]
            if (groupIdInQuery) {
               const activeGroupIndex = newGroups.findIndex(
                  (el) => el.groupId === groupIdInQuery
               )
               if (activeGroupIndex > -1) {
                  newGroups = repositionElementInArray(
                     newGroups,
                     activeGroupIndex,
                     0
                  )
               }
            }
            setGroups(newGroups)
         }
         // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [groupIdInQuery, followingGroups])

      const content = (
         <Box sx={styles.root}>
            <Stack spacing={1}>
               <List sx={{ display: { lg: "none" } }}>
                  {isLoggedOut ? <LoginButton /> : null}
                  {drawerTopLinks.map((link) => (
                     <NavElement key={link.title} {...link} />
                  ))}
                  <Divider />
               </List>
               {isLoggedOut ? <NavPrompt /> : null}
            </Stack>
            <Box>
               {loading ? (
                  <CircularProgress style={{ margin: "auto" }} />
               ) : (
                  <List>
                     {groups?.length ? (
                        groups?.map(({ universityName, groupId, logoUrl }) => (
                           <GroupNavLink
                              key={groupId}
                              groupId={groupId}
                              onClick={onMobileClose}
                              groupIdInQuery={groupIdInQuery as string}
                              alt={universityName}
                              src={getResizedUrl(logoUrl, "xs")}
                           />
                        ))
                     ) : isLoggedIn ? (
                        <ListItem>
                           <NavPrompt
                              title={"Start registering"}
                              subtitle={"And track your events here"}
                              imageSrc={registerIllustrationSvg}
                              noLink
                           />
                        </ListItem>
                     ) : null}
                  </List>
               )}
            </Box>
            <Box sx={{ mt: "auto !important" }}>
               <Divider />
               <List>
                  {drawerBottomLinks.map((link) => (
                     <NavElement key={link.title} {...link} />
                  ))}
                  {userData ? (
                     <NavElement
                        href="#"
                        onClick={signOut}
                        icon={LogoutIcon}
                        title="LOGOUT"
                     />
                  ) : null}
               </List>
            </Box>
         </Box>
      )

      return (
         <>
            <Hidden lgUp>
               <Drawer
                  anchor="left"
                  PaperProps={{
                     sx: [styles.mobileDrawer, styles.background],
                  }}
                  sx={styles.drawer}
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
                  PaperProps={{
                     sx: [styles.desktopDrawer, styles.background],
                  }}
                  sx={styles.drawer}
                  open
                  variant="persistent"
               >
                  {content}
               </Drawer>
            </Hidden>
         </>
      )
   }
)

FeedDrawer.displayName = "FeedDrawer"

export default FeedDrawer
