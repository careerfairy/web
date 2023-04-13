import { useRouter } from "next/router"

// material-ui
import { Box, ListItemIcon, Menu, MenuItem, Typography } from "@mui/material"
import Tooltip from "@mui/material/Tooltip"
import Stack from "@mui/material/Stack"
import IconButton from "@mui/material/IconButton"
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined"
import LogoutIcon from "@mui/icons-material/PowerSettingsNewOutlined"

// project imports
import { sxStyles } from "../../../types/commonTypes"
import { useAuth } from "../../../HOCs/AuthProvider"
import ColorizedAvatar from "../../../components/views/common/ColorizedAvatar"
import useMenuState from "../../../components/custom-hook/useMenuState"
import { getMaxLineStyles } from "../../../components/helperFunctions/HelperFunctions"
import { alpha } from "@mui/material/styles"

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
         xs: 43,
         sm: 53,
      },
      height: {
         xs: 43,
         sm: 53,
      },
      lineHeight: 0,
      border: (theme) => `3px solid ${theme.palette.primary.main}`,
   },
   details: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "center",
      ml: 2,
   },
   maxOneLine: {
      ...getMaxLineStyles(1),
   },
   companyText: {
      color: (theme) => alpha(theme.palette.text.secondary, 0.4),
   },
})
const UserAvatar = () => {
   const { handleClick, open, handleClose, anchorEl } = useMenuState()
   const { userData, signOut, userPresenter } = useAuth()
   const { push } = useRouter()

   if (!userData || !userData.id) {
      return null
   }

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
                     lastName={userData?.lastName}
                     firstName={userData?.firstName}
                     sx={styles.ava}
                  />
               </IconButton>
            </Tooltip>
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
            <Stack spacing={2}>
               <MenuItem sx={{ mb: 1 }}>
                  <ColorizedAvatar
                     lastName={userData?.lastName}
                     firstName={userData?.firstName}
                     sx={[styles.ava, { border: "none" }]}
                  />
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
                        {userPresenter?.getFieldOfStudyDisplayName()}
                     </Typography>
                  </Box>
               </MenuItem>
               <MenuItem onClick={() => push("/profile")}>
                  <ListItemIcon>
                     <PersonOutlineOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
               </MenuItem>
               <MenuItem onClick={signOut}>
                  <ListItemIcon>
                     <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
               </MenuItem>
            </Stack>
         </Menu>
      </>
   )
}

const transformOrigin = { horizontal: "right", vertical: "top" } as const
const anchorOrigin = { horizontal: "right", vertical: "bottom" } as const

export default UserAvatar
