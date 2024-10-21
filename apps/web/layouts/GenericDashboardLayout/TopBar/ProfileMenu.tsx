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
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import useIsMobile from "components/custom-hook/useIsMobile"
import { CompanyIcon } from "components/views/common/icons"
import { supportPageLink } from "constants/links"
import Link from "next/link"
import { useCallback, useMemo } from "react"
import { Briefcase, HelpCircle, LogOut, User } from "react-feather"
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
   userName: {
      fontWeight: 600,
      fontSize: "16px",
      lineHeight: "24px",
   },
   userFieldOfStudy: {
      fontWeight: 400,
      fontSize: "12px",
      lineHeight: "16px",
   },
   profileMenu: {
      "& .MuiPaper-root": {
         minWidth: {
            xs: "65vw",
            sm: "40vw",
         },
         top: "0 !important",
         right: "0 !important",
         minHeight: "100%",
         borderTopRightRadius: "0px",
         borderBottomRightRadius: "0px",
      },
      "& .MuiBackdrop-root": {
         backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black
      },
      "& .MuiList-root": {
         height: "100vh",
      },
   },
   profileMenuRoot: {
      height: "100%",
      justifyContent: "space-between",
      p: "12px",
      pt: "20px",
   },
   menuItem: {
      p: "12px 8px",
   },
})

const ProfileMenu = () => {
   const { handleClick, open, handleClose, anchorEl } = useMenuState()
   const { userData, signOut, userPresenter, adminGroups } = useAuth()
   const { push } = useRouter()

   const { jobHubV1, talentProfileV1 } = useFeatureFlags()
   const isMobile = useIsMobile()
   const useNewMenu = talentProfileV1 && isMobile

   const fieldOfStudyDisplayName = useMemo(
      () => userPresenter?.getFieldOfStudyDisplayName(talentProfileV1),
      [userPresenter, talentProfileV1]
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

   /*
   const AvatarMenuItem = () => {
      return (
         <MenuItem sx={{ p: 1 }} onClick={handleProfileClick}>
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
                     sx={[styles.maxOneLine, styles.userName]}
                     color={"neutral.800"}
                  >
                     {userPresenter?.getDisplayName()}
                  </Typography>

                  <Typography
                     sx={[styles.maxOneLine, styles.companyText, styles.userFieldOfStudy]}
                     color={"neutral.500"}
                  >
                     {fieldOfStudyDisplayName}
                  </Typography>
               </Box>
            </Tooltip>
         </MenuItem>
      )
   }
   const ProfileMenuItem = () => {
      return (
         <MenuItem onClick={handleProfileClick} sx={styles.menuItem}>
            <ListItemIcon>
               <User width={"20px"} height={"20px"} />
            </ListItemIcon>
            <Typography color={"text.secondary"}>Profile</Typography>
         </MenuItem>
      )
   }

   const MyJobsMenuItem = () => {
      if (!jobHubV1)
         return null
      return (
         <MenuItem onClick={() => push("/profile/my-jobs")} sx={styles.menuItem}>
            <ListItemIcon>
               <Briefcase width={"20px"} height={"20px"} />
            </ListItemIcon>
            <Typography color={"text.secondary"}>My Jobs</Typography>
         </MenuItem>
      )
   }

   const FollowingCompaniesMenuItem = () => {
      return (
         <MenuItem onClick={() => push("/profile/following-companies")} sx={styles.menuItem}>
            <ListItemIcon sx={{ width: "20px", height: "20px" }}>
               <CompanyIcon />
            </ListItemIcon>
            <Typography color={"text.secondary"}>Following Companies</Typography>
         </MenuItem>
      )
   }

   const LogOutMenuItem = () => {
      return (
         <MenuItem onClick={signOut} sx={styles.menuItem}>
            <ListItemIcon>
               <LogOut width={"20px"} height={"20px"} />
            </ListItemIcon>
            <Typography color={"text.secondary"}>Log out</Typography>
         </MenuItem>
      )
   }
   */

   const TalentProfileMenuItems = () => {
      return (
         <Stack spacing={2} sx={styles.profileMenuRoot}>
            <Stack spacing={3}>
               <MenuItem sx={{ p: 1 }} onClick={handleProfileClick}>
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
                           sx={[styles.maxOneLine, styles.userName]}
                           color={"neutral.800"}
                        >
                           {userPresenter?.getDisplayName()}
                        </Typography>

                        <Typography
                           sx={[
                              styles.maxOneLine,
                              styles.companyText,
                              styles.userFieldOfStudy,
                           ]}
                           color={"neutral.500"}
                        >
                           {fieldOfStudyDisplayName}
                        </Typography>
                     </Box>
                  </Tooltip>
               </MenuItem>
               <Stack spacing={1}>
                  <MenuItem onClick={handleProfileClick} sx={styles.menuItem}>
                     <ListItemIcon>
                        <User width={"20px"} height={"20px"} />
                     </ListItemIcon>
                     <Typography color={"text.secondary"}>Profile</Typography>
                  </MenuItem>
                  {jobHubV1 ? (
                     <MenuItem
                        onClick={() => push("/profile/my-jobs")}
                        sx={styles.menuItem}
                     >
                        <ListItemIcon>
                           <Briefcase width={"20px"} height={"20px"} />
                        </ListItemIcon>
                        <Typography color={"text.secondary"}>
                           My Jobs
                        </Typography>
                     </MenuItem>
                  ) : null}

                  <MenuItem
                     onClick={() => push("/profile/following-companies")}
                     sx={styles.menuItem}
                  >
                     <ListItemIcon sx={{ width: "20px", height: "20px" }}>
                        <CompanyIcon />
                     </ListItemIcon>
                     <Typography color={"text.secondary"}>
                        Following Companies
                     </Typography>
                  </MenuItem>
               </Stack>
            </Stack>

            <Stack spacing={2}>
               <Link href={supportPageLink} target="_blank">
                  <MenuItem sx={styles.menuItem}>
                     <ListItemIcon>
                        <HelpCircle width={"20px"} height={"20px"} />
                     </ListItemIcon>
                     <Typography color={"text.secondary"}>Support</Typography>
                  </MenuItem>
               </Link>

               <Divider sx={{ width: "100%", alignSelf: "center" }} />

               <MenuItem onClick={signOut} sx={styles.menuItem}>
                  <ListItemIcon>
                     <LogOut width={"20px"} height={"20px"} />
                  </ListItemIcon>
                  <Typography color={"text.secondary"}>Log out</Typography>
               </MenuItem>
            </Stack>
         </Stack>
      )
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
            sx={useNewMenu ? styles.profileMenu : null}
         >
            {useNewMenu ? (
               <TalentProfileMenuItems />
            ) : (
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
                              sx={[
                                 styles.maxOneLine,
                                 talentProfileV1 ? styles.userName : null,
                              ]}
                              variant={talentProfileV1 ? undefined : "h6"}
                              fontWeight={talentProfileV1 ? undefined : 500}
                              color={
                                 talentProfileV1 ? "neutral.800" : undefined
                              }
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
                  {jobHubV1 ? (
                     <MenuItem onClick={() => push("/profile/my-jobs")}>
                        <ListItemIcon>
                           <Briefcase width={"17.5px"} height={"17.5px"} />
                        </ListItemIcon>
                        <Typography color={"text.secondary"}>
                           My Jobs
                        </Typography>
                     </MenuItem>
                  ) : null}
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

                  <MenuItem
                     onClick={signOut}
                     sx={{ marginTop: "0 !important" }}
                  >
                     <ListItemIcon>
                        <LogoutOutlinedIcon fontSize="small" />
                     </ListItemIcon>
                     <Typography color={"text.secondary"}>Logout</Typography>
                  </MenuItem>
               </Stack>
            )}
         </Menu>
      </>
   )
}

const transformOrigin = { horizontal: "right", vertical: "top" } as const
const anchorOrigin = { horizontal: "right", vertical: "bottom" } as const

export default ProfileMenu
