import { useRouter } from "next/router"

// material-ui
import ContentPasteOutlinedIcon from "@mui/icons-material/ContentPasteOutlined"
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined"
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined"
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined"
import StarOutlineIcon from "@mui/icons-material/StarOutline"
import { Box, ListItemIcon, Menu, MenuItem, Typography } from "@mui/material"
import IconButton from "@mui/material/IconButton"
import Stack from "@mui/material/Stack"
import Tooltip from "@mui/material/Tooltip"

// project imports
import Divider from "@mui/material/Divider"
import { alpha } from "@mui/material/styles"
import { FC, useCallback, useMemo } from "react"
import { useAuth } from "../../../HOCs/AuthProvider"
import useMenuState from "../../../components/custom-hook/useMenuState"
import { getMaxLineStyles } from "../../../components/helperFunctions/HelperFunctions"
import ColorizedAvatar from "../../../components/views/common/ColorizedAvatar"
import { sxStyles } from "../../../types/commonTypes"

const styles = sxStyles({
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
      display: "inline",
      maxWidth: "200px",
   },
   creditDetails: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "center",
   },
})

const ProfileMenu: FC = () => {
   const { handleClick, open, handleClose, anchorEl } = useMenuState()
   const { userData, signOut, userPresenter, adminGroups } = useAuth()
   const { push } = useRouter()
   const fieldOfStudyDisplayName = useMemo(
      () => userPresenter?.getFieldOfStudyDisplayName(),
      [userPresenter]
   )

   const handleProfileClick = useCallback(() => {
      if (Object.keys(adminGroups).length) {
         const groupId = Object.keys(adminGroups)[0]

         return push(`/group/${groupId}/admin/profile`)
      }

      void push("/profile")
   }, [adminGroups, push])

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
                     imageUrl={userData?.avatar}
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
            disableScrollLock={true}
         >
            <Stack spacing={2}>
               <MenuItem sx={{ mb: 1 }} onClick={handleProfileClick}>
                  <ColorizedAvatar
                     imageUrl={userData?.avatar}
                     lastName={userData?.lastName}
                     firstName={userData?.firstName}
                     sx={[styles.ava, { border: "none" }]}
                  />
                  <Tooltip
                     title={fieldOfStudyDisplayName}
                     disableHoverListener={
                        fieldOfStudyDisplayName
                           ? fieldOfStudyDisplayName?.length <= 15
                           : true
                     }
                  >
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
                           {fieldOfStudyDisplayName}
                        </Typography>
                     </Box>
                  </Tooltip>
               </MenuItem>
               <MenuItem onClick={handleProfileClick}>
                  <ListItemIcon>
                     <PersonOutlineOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography color={"text.secondary"}>Profile</Typography>
               </MenuItem>
               <MenuItem onClick={() => push("/profile/career-skills")}>
                  <ListItemIcon>
                     <StarOutlineIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography color={"text.secondary"}>
                     My career skills
                  </Typography>
               </MenuItem>
               <MenuItem onClick={() => push("/profile/referrals")}>
                  <ListItemIcon>
                     <PeopleOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography color={"text.secondary"}>Referrals</Typography>
               </MenuItem>
               <MenuItem onClick={() => push("/profile/saved-recruiters")}>
                  <ListItemIcon>
                     <ContentPasteOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography color={"text.secondary"}>
                     My Recruiters
                  </Typography>
               </MenuItem>

               <Divider sx={{ width: "80%", alignSelf: "center" }} />

               <MenuItem onClick={signOut} sx={{ marginTop: "0 !important" }}>
                  <ListItemIcon>
                     <LogoutOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography color={"text.secondary"}>Logout</Typography>
               </MenuItem>
            </Stack>
         </Menu>
      </>
   )
}

const transformOrigin = { horizontal: "right", vertical: "top" } as const
const anchorOrigin = { horizontal: "right", vertical: "bottom" } as const

export default ProfileMenu
