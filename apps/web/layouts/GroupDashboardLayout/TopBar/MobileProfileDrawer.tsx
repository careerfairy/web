import { useRouter } from "next/router"
import { Fragment, useCallback, useEffect } from "react"

// material-ui
import {
   Box,
   Divider,
   List,
   ListItem,
   ListItemButton,
   ListItemIcon,
   ListItemText,
   Stack,
   SwipeableDrawer,
   Typography,
} from "@mui/material"
import { styled } from "@mui/material/styles"

// react-feather icons
import { Home, LogOut, Repeat, User } from "react-feather"

// project imports
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import { useAuth } from "../../../HOCs/AuthProvider"
import ColorizedAvatar from "../../../components/views/common/ColorizedAvatar"
import ManageCompaniesDialog from "../../../components/views/profile/my-groups/ManageCompaniesDialog"
import { useGroupDashboard } from "../GroupDashboardLayoutProvider"
import { useGroup } from "../index"

const StyledDrawer = styled(SwipeableDrawer)(({ theme }) => ({
   "& .MuiDrawer-paper": {
      width: 283,
      height: "100%",
      backgroundColor: "#FEFEFE",
      border: "1px solid #F3F3F5",
      borderRadius: "6px 0px 0px 6px",
      padding: "16px 12px",
      right: 0,
      [theme.breakpoints.up("md")]: {
         display: "none", // Hide on desktop
      },
   },
}))

const ProfileSection = styled(Box)({
   display: "flex",
   alignItems: "center",
   gap: "8px",
   padding: "8px",
   marginBottom: "24px",
})

const MenuItemButton = styled(ListItemButton)({
   padding: "12px 8px",
   borderRadius: "4px",
   "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04)",
   },
})

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
   minWidth: "32px",
   color: theme.palette.neutral[700],
}))

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
   "& .MuiListItemText-primary": {
      color: theme.palette.neutral[700],
      ...theme.typography.medium,
   },
}))

const LogoutButton = styled(ListItemButton)({
   padding: "12px 8px",
   borderRadius: "4px",
   "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04)",
   },
})

const UserAvatar = styled(ColorizedAvatar)(({ theme }) => ({
   width: 48,
   height: 48,
   border: `1px solid ${theme.brand.white[100]}`,
   boxShadow: "0px 0px 8px 0px rgba(20, 20, 20, 0.06)",
}))

const StyledDivider = styled(Divider)({
   marginBottom: "8px",
   color: "rgba(0, 0, 0, 0.1)",
})

export const MobileProfileDrawer = () => {
   const { layout, setMobileProfileDrawer } = useGroupDashboard()
   const { userData, signOut, userPresenter, adminGroups } = useAuth()
   const { group } = useGroup()
   const { push } = useRouter()

   const [
      openManageCompaniesDialog,
      handleOpenManageCompaniesDialog,
      handleCloseManageCompaniesDialog,
   ] = useDialogStateHandler()

   /**
    * Close the drawer when the component unmounts
    */
   useEffect(() => {
      return () => {
         setMobileProfileDrawer(false)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [])

   const handleClose = useCallback(() => {
      setMobileProfileDrawer(false)
   }, [setMobileProfileDrawer])

   const showSwitchButton =
      userData?.isAdmin || Object.keys(adminGroups).length > 1

   const handleProfileClick = () => {
      push(`/group/${group?.id}/admin/profile`)
      handleClose()
   }

   const handleSwitchCompanyClick = () => {
      handleOpenManageCompaniesDialog()
      handleClose()
   }

   const handlePortalClick = () => {
      push("/portal")
      handleClose()
   }

   const handleLogoutClick = () => {
      signOut()
      handleClose()
   }

   return (
      <Fragment>
         <StyledDrawer
            anchor="right"
            open={layout.mobileProfileDrawerOpen}
            onClose={handleClose}
            onOpen={() => setMobileProfileDrawer(true)}
         >
            {/* Profile Section */}
            <ProfileSection>
               <UserAvatar
                  imageUrl={userData?.avatar}
                  lastName={userData?.lastName}
                  firstName={userData?.firstName}
               />
               <Stack>
                  <Typography
                     variant="medium"
                     color="neutral.800"
                     fontWeight={600}
                  >
                     {userPresenter?.getDisplayName()}
                  </Typography>
                  <Typography variant="xsmall" color="neutral.600">
                     {userPresenter?.getPosition()}
                  </Typography>
               </Stack>
            </ProfileSection>

            {/* Menu Items */}
            <Box gap={2} display="flex" flexDirection="column" flexGrow={1}>
               <List sx={{ padding: 0 }}>
                  {/* Profile */}
                  <ListItem disablePadding>
                     <MenuItemButton onClick={handleProfileClick}>
                        <StyledListItemIcon>
                           <User size={20} />
                        </StyledListItemIcon>
                        <StyledListItemText primary="Profile" />
                     </MenuItemButton>
                  </ListItem>

                  {/* Switch Company */}
                  {Boolean(showSwitchButton) && (
                     <ListItem disablePadding>
                        <MenuItemButton onClick={handleSwitchCompanyClick}>
                           <StyledListItemIcon>
                              <Repeat size={20} />
                           </StyledListItemIcon>
                           <StyledListItemText primary="Switch company" />
                        </MenuItemButton>
                     </ListItem>
                  )}

                  {/* Student Portal */}
                  <ListItem disablePadding>
                     <MenuItemButton onClick={handlePortalClick}>
                        <StyledListItemIcon>
                           <Home size={20} />
                        </StyledListItemIcon>
                        <StyledListItemText primary="Student portal" />
                     </MenuItemButton>
                  </ListItem>
               </List>

               {/* Bottom Section with Logout */}
               <Box display="flex" flexDirection="column" mt="auto">
                  <StyledDivider />
                  <List sx={{ padding: 0 }}>
                     <ListItem disablePadding>
                        <LogoutButton onClick={handleLogoutClick}>
                           <StyledListItemIcon>
                              <LogOut size={20} />
                           </StyledListItemIcon>
                           <StyledListItemText primary="Log out" />
                        </LogoutButton>
                     </ListItem>
                  </List>
               </Box>
            </Box>
         </StyledDrawer>

         {/* Manage Companies Dialog */}
         {Boolean(openManageCompaniesDialog) && (
            <ManageCompaniesDialog
               open={openManageCompaniesDialog}
               handleClose={handleCloseManageCompaniesDialog}
            />
         )}
      </Fragment>
   )
}
