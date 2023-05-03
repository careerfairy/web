import React, { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/router"

// material-ui
import {
   Box,
   Divider,
   ListItemIcon,
   Menu,
   MenuItem,
   Typography,
} from "@mui/material"
import Tooltip from "@mui/material/Tooltip"
import Stack from "@mui/material/Stack"
import IconButton from "@mui/material/IconButton"
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined"
import LogoutIcon from "@mui/icons-material/PowerSettingsNewOutlined"
import { Home as HomeIcon, Repeat as SyncIcon } from "react-feather"

// project imports
import { sxStyles } from "../../../types/commonTypes"
import { useAuth } from "../../../HOCs/AuthProvider"
import ColorizedAvatar from "../../../components/views/common/ColorizedAvatar"
import useMenuState from "../../../components/custom-hook/useMenuState"
import useIsMobile from "../../../components/custom-hook/useIsMobile"
import { getMaxLineStyles } from "../../../components/helperFunctions/HelperFunctions"
import { useGroup } from "../index"
import { alpha } from "@mui/material/styles"
import ManageCompaniesDialog from "../../../components/views/profile/my-groups/ManageCompaniesDialog"

const styles = sxStyles({
   root: {
      borderRadius: 6,
   },
   notificationBtn: {
      color: "text.primary",
      backgroundColor: "background.paper",
   },
   ava: {
      width: {
         xs: 40,
         sm: 50,
      },
      height: {
         xs: 40,
         sm: 50,
      },
      lineHeight: 0,
   },
   details: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "center",
   },
   maxOneLine: {
      ...getMaxLineStyles(1),
   },
   companyText: {
      color: (theme) => alpha(theme.palette.text.secondary, 0.4),
   },
})
const UserAvatarWithDetails = () => {
   const { handleClick, open, handleClose, anchorEl } = useMenuState()
   const { userData, signOut, userPresenter, adminGroups } = useAuth()
   const { group } = useGroup()
   const isMobile = useIsMobile()
   const { push } = useRouter()

   const [openManageCompaniesDialog, setOpenManageCompaniesDialog] =
      useState(false)

   const handleCloseManageCompaniesDialog = useCallback(() => {
      setOpenManageCompaniesDialog(false)
   }, [])

   const showSwitchButton = useMemo(
      () => userData?.isAdmin || Object.keys(adminGroups).length > 1,
      [adminGroups, userData?.isAdmin]
   )

   const showPortalButton = useMemo(
      () => userData?.isAdmin,
      [userData?.isAdmin]
   )

   return (
      <>
         <Stack direction={"row"} spacing={1}>
            <Tooltip title="Account settings">
               <IconButton
                  onClick={handleClick}
                  size="small"
                  aria-controls={open ? "account-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
               >
                  <ColorizedAvatar
                     imageUrl={userData?.avatar}
                     lastName={userData?.lastName}
                     firstName={userData?.firstName}
                     sx={styles.ava}
                  />
               </IconButton>
            </Tooltip>
            {!isMobile && (
               <Box sx={styles.details}>
                  <Typography
                     sx={styles.maxOneLine}
                     variant={"h6"}
                     fontWeight={500}
                  >
                     {userPresenter?.getDisplayName()}
                  </Typography>
                  <Typography
                     sx={[styles.maxOneLine, styles.companyText]}
                     color={"text.secondary"}
                     variant={"subtitle1"}
                  >
                     {group?.universityName}
                  </Typography>
               </Box>
            )}
         </Stack>
         <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            transformOrigin={transformOrigin}
            anchorOrigin={anchorOrigin}
         >
            {[
               <MenuItem
                  onClick={() => push(`/group/${group.id}/admin/profile`)}
                  key="profile"
               >
                  <ListItemIcon>
                     <PersonOutlineOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  My Profile
               </MenuItem>,
               <Divider key="divider1" />,
               ...(showSwitchButton
                  ? [
                       <MenuItem
                          onClick={() => setOpenManageCompaniesDialog(true)}
                          key="switch-company"
                       >
                          <ListItemIcon>
                             <SyncIcon size="1em" />
                          </ListItemIcon>
                          Switch Company
                       </MenuItem>,
                       <Divider key="divider2" />,
                    ]
                  : []),
               ...(showPortalButton
                  ? [
                       <MenuItem onClick={() => push("/portal")} key="portal">
                          <ListItemIcon>
                             <HomeIcon size="1em" />
                          </ListItemIcon>
                          Portal
                       </MenuItem>,
                       <Divider key="divider2" />,
                    ]
                  : []),
               <MenuItem onClick={signOut} key="logout">
                  <ListItemIcon>
                     <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
               </MenuItem>,
            ]}
         </Menu>
         {openManageCompaniesDialog ? (
            <ManageCompaniesDialog
               open={openManageCompaniesDialog}
               handleClose={handleCloseManageCompaniesDialog}
            />
         ) : null}
      </>
   )
}

const transformOrigin = { horizontal: "right", vertical: "top" } as const
const anchorOrigin = { horizontal: "right", vertical: "bottom" } as const

export default UserAvatarWithDetails
