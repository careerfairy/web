import { useRouter } from "next/router"

// material-ui
import { Box, ListItemIcon, Menu, MenuItem, Typography } from "@mui/material"
import Tooltip from "@mui/material/Tooltip"
import Stack from "@mui/material/Stack"
import IconButton from "@mui/material/IconButton"
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined"
import StarOutlineIcon from "@mui/icons-material/StarOutline"
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined"
import ContentPasteOutlinedIcon from "@mui/icons-material/ContentPasteOutlined"
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined"

// project imports
import { sxStyles } from "../../../types/commonTypes"
import { useAuth } from "../../../HOCs/AuthProvider"
import ColorizedAvatar from "../../../components/views/common/ColorizedAvatar"
import useMenuState from "../../../components/custom-hook/useMenuState"
import { getMaxLineStyles } from "../../../components/helperFunctions/HelperFunctions"
import { alpha } from "@mui/material/styles"
import Divider from "@mui/material/Divider"
import CareerCoinIcon from "../../../components/views/common/CareerCoinIcon"
import { useMemo } from "react"
import { useGenericDashboard } from "../index"

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
const ProfileMenu = () => {
   const { handleOpenCreditsDialog } = useGenericDashboard()
   const { handleClick, open, handleClose, anchorEl } = useMenuState()
   const { userData, signOut, userPresenter } = useAuth()
   const { push } = useRouter()
   const fieldOfStudyDisplayName = useMemo(
      () => userPresenter?.getFieldOfStudyDisplayName(),
      [userPresenter]
   )

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
            disableScrollLock={true}
         >
            <Stack spacing={2}>
               <MenuItem sx={{ mb: 1 }} onClick={() => push("/profile")}>
                  <ColorizedAvatar
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
               <MenuItem onClick={() => push("/profile")}>
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

               <MenuItem
                  sx={{ mb: 1, alignItems: "start" }}
                  onClick={handleOpenCreditsDialog}
               >
                  <ListItemIcon>
                     <CareerCoinIcon />
                  </ListItemIcon>
                  <Box sx={styles.creditDetails}>
                     <Box sx={{ display: "flex" }}>
                        <Typography
                           fontWeight={600}
                           color={"text.secondary"}
                           mr={1}
                        >
                           {userData?.credits || 0}
                        </Typography>
                        <Typography color={"text.secondary"}>
                           CareerCoins
                        </Typography>
                     </Box>
                     <Typography
                        color={"text.secondary"}
                        variant={"body2"}
                        sx={{ textDecoration: "underline" }}
                     >
                        Get more now
                     </Typography>
                  </Box>
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
