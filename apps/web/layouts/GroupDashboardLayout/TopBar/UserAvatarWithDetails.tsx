import React from "react"
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
import ChangeGroupIcon from "@mui/icons-material/LoopOutlined"
import LogoutIcon from "@mui/icons-material/PowerSettingsNewOutlined"

// project imports
import { sxStyles } from "../../../types/commonTypes"
import { useAuth } from "../../../HOCs/AuthProvider"
import ColorizedAvatar from "../../../components/views/common/ColorizedAvatar"
import useMenuState from "../../../components/custom-hook/useMenuState"
import useIsMobile from "../../../components/custom-hook/useIsMobile"
import { getMaxLineStyles } from "../../../components/helperFunctions/HelperFunctions"

const styles = sxStyles({
   root: {
      borderRadius: 6,
   },
   notificationBtn: {
      color: "text.primary",
      backgroundColor: "background.paper",
   },
   ava: {
      width: 50,
      height: 50,
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
})
const UserAvatarWithDetails = () => {
   const { handleClick, open, handleClose, anchorEl } = useMenuState()

   const { userData, signOut, userPresenter } = useAuth()

   const isMobile = useIsMobile()

   const { push } = useRouter()

   return (
      <>
         <Stack direction={"row"} spacing={2}>
            <Tooltip title="Account settings">
               <IconButton
                  onClick={handleClick}
                  size="small"
                  aria-controls={open ? "account-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
               >
                  <ColorizedAvatar
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
                     fontWeight={600}
                  >
                     {userPresenter?.getDisplayName()}
                  </Typography>
                  <Typography
                     sx={styles.maxOneLine}
                     color={"text.secondary"}
                     variant={"subtitle2"}
                  >
                     {userData?.userEmail}
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
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
         >
            <MenuItem onClick={() => push("/profile")}>
               <ListItemIcon>
                  <PersonOutlineOutlinedIcon fontSize="small" />
               </ListItemIcon>
               My Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => push("/profile/groups?type=admin")}>
               <ListItemIcon>
                  <ChangeGroupIcon fontSize="small" />
               </ListItemIcon>
               Switch Company
            </MenuItem>
            <Divider />
            <MenuItem onClick={signOut}>
               <ListItemIcon>
                  <LogoutIcon fontSize="small" />
               </ListItemIcon>
               Logout
            </MenuItem>
         </Menu>
      </>
   )
}

export default UserAvatarWithDetails
