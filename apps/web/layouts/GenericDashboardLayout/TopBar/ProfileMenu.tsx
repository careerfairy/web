import { useRouter } from "next/router"

// material-ui
import ContentPasteOutlinedIcon from "@mui/icons-material/ContentPasteOutlined"
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined"
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined"
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined"
import StarOutlineIcon from "@mui/icons-material/StarOutline"
import {
   Box,
   ListItemIcon,
   Menu,
   MenuItem,
   SxProps,
   Typography,
} from "@mui/material"
import IconButton from "@mui/material/IconButton"
import Stack from "@mui/material/Stack"
import Tooltip from "@mui/material/Tooltip"
import { DefaultTheme } from "@mui/styles/defaultTheme"

// project imports
import Divider from "@mui/material/Divider"
import { alpha } from "@mui/material/styles"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import useIsMobile from "components/custom-hook/useIsMobile"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { CompanyIcon } from "components/views/common/icons"
import { SlideLeftTransition } from "components/views/common/transitions"
import { BrandedTooltip } from "components/views/streaming-page/components/BrandedTooltip"
import { supportPageLink } from "constants/links"
import { TAB_VALUES } from "layouts/UserLayout/TalentProfile/constants"
import Link from "next/link"
import { useCallback, useMemo, useState } from "react"
import { Briefcase, HelpCircle, LogOut, User } from "react-feather"
import { useAuth } from "../../../HOCs/AuthProvider"
import useMenuState from "../../../components/custom-hook/useMenuState"
import { getMaxLineStyles } from "../../../components/helperFunctions/HelperFunctions"
import ColorizedAvatar from "../../../components/views/common/ColorizedAvatar"
import { combineStyles, sxStyles } from "../../../types/commonTypes"

const styles = sxStyles({
   ava: {
      width: 40,
      height: 40,
      lineHeight: 0,
      border: "2px solid #00D2AA",
   },
   newMenuAva: {
      ml: "8px",
   },
   profileButton: {
      ml: "16px !important",
   },
   iconButton: { padding: 0 },
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
      overflow: "hidden",
      textOverflow: "ellipsis",
      width: "175px !important",
   },
   userFieldOfStudy: {
      fontWeight: 400,
      color: (theme) => theme.palette.neutral[600],
   },
   profileMenu: {
      "& .MuiPaper-root": {
         left: "unset !important",
         top: "0 !important",
         right: "0 !important",
         minHeight: "100%",
         borderTopRightRadius: "0px",
         borderBottomRightRadius: "0px",
      },
      "& .MuiBackdrop-root": {
         backgroundColor: "rgba(0, 0, 0, 0.5)",
      },
      "& .MuiList-root": {
         height: "100dvh",
      },
   },
   desktopProfileMenu: {
      "& .MuiList-root": {
         py: "0 !important",
      },
   },
   profileMenuRoot: {
      width: "280px",
      height: "100%",
      justifyContent: "space-between",
   },
   desktopProfileMenuRoot: {
      width: "280px",
   },
   menuItem: {
      height: "40px",
      p: "12px",
      py: "26px",
      pl: "20px",
      "&:hover": {
         backgroundColor: (theme) => theme.brand.white[400],
      },
   },
   desktopMenuItem: {
      py: 3,
   },
   desktopLogoutMenuItem: {
      py: 3,
   },
   desktopFollowingCompaniesMenuItem: {
      py: 3,
   },
   avatarMenuItem: {
      py: 3,
      px: 1.5,
      "&:hover": {
         backgroundColor: (theme) => theme.brand.white[400],
      },
   },
   desktopAvatarMenuItem: {
      py: 2,
   },
   menuItemText: {
      fontSize: {
         sm: "16px",
         md: "14px",
      },
   },
   icon: {
      mr: 1,
      color: (theme) => theme.palette.neutral[700],
      width: "20px !important",
      height: "20px !important",
   },
})

type CustomMenuItemProps = {
   sx?: SxProps<DefaultTheme>
}

const ProfileMenu = () => {
   const { handleClick, open, handleClose, anchorEl } = useMenuState()
   const { userData, signOut, userPresenter, adminGroups } = useAuth()
   const { push } = useRouter()

   const isMobile = useIsMobile()

   const [menuAnimating, setMenuAnimating] = useState(false)

   const { talentProfileV1 } = useFeatureFlags()

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

   const useNewMobileMenu = talentProfileV1 && isMobile

   const disableHoverListener = fieldOfStudyDisplayName
      ? fieldOfStudyDisplayName?.length <= 15
      : true

   const disableScrollLock = talentProfileV1 ? !isMobile : true

   if (!userData || !userData.id) {
      return null
   }

   const AvatarMenuItem = ({ sx }: CustomMenuItemProps) => {
      return (
         <MenuItem
            sx={combineStyles(styles.avatarMenuItem, sx)}
            onClick={!menuAnimating ? handleProfileClick : undefined}
         >
            <ColorizedAvatar
               imageUrl={userData?.avatar}
               lastName={userData?.lastName}
               firstName={userData?.firstName}
               sx={[styles.ava, { border: "none" }, styles.newMenuAva]}
            />
            <Box sx={styles.details}>
               <Typography
                  sx={[styles.userName]}
                  variant="brandedBody"
                  color={"neutral.800"}
                  component={"span"}
               >
                  {userPresenter?.getDisplayName()}
               </Typography>

               <Typography
                  sx={[
                     styles.maxOneLine,
                     styles.companyText,
                     styles.userFieldOfStudy,
                  ]}
                  variant="xsmall"
                  color={"neutral.500"}
               >
                  {fieldOfStudyDisplayName}
               </Typography>
            </Box>
         </MenuItem>
      )
   }

   const ProfileMenuItem = ({ sx }: CustomMenuItemProps) => {
      return (
         <MenuItem
            onClick={handleProfileClick}
            sx={combineStyles(styles.menuItem, sx)}
         >
            <ListItemIcon>
               <Box component={User} sx={styles.icon} />
            </ListItemIcon>
            <Typography color={"text.secondary"} sx={styles.menuItemText}>
               Profile
            </Typography>
         </MenuItem>
      )
   }

   const MyJobsMenuItem = ({ sx }: CustomMenuItemProps) => {
      return (
         <MenuItem
            onClick={() => push(TAB_VALUES.jobs.value)}
            sx={combineStyles(styles.menuItem, sx)}
         >
            <ListItemIcon>
               <Box component={Briefcase} sx={styles.icon} />
            </ListItemIcon>
            <Typography color={"text.secondary"} sx={styles.menuItemText}>
               My Jobs
            </Typography>
         </MenuItem>
      )
   }

   const FollowingCompaniesMenuItem = ({ sx }: CustomMenuItemProps) => {
      return (
         <MenuItem
            onClick={() => push(TAB_VALUES.company.value)}
            sx={combineStyles(styles.menuItem, sx)}
         >
            <ListItemIcon>
               <CompanyIcon sx={styles.icon} />
            </ListItemIcon>
            <Typography color={"text.secondary"} sx={styles.menuItemText}>
               Followed Companies
            </Typography>
         </MenuItem>
      )
   }

   const SupportLinkMenuItem = ({ sx }: CustomMenuItemProps) => {
      return (
         <Link href={supportPageLink} target="_blank">
            <MenuItem sx={combineStyles(styles.menuItem, sx)}>
               <ListItemIcon>
                  <Box component={HelpCircle} sx={styles.icon} />
               </ListItemIcon>
               <Typography color={"text.secondary"} sx={styles.menuItemText}>
                  Support
               </Typography>
            </MenuItem>
         </Link>
      )
   }

   const LogOutMenuItem = ({ sx }: CustomMenuItemProps) => {
      return (
         <MenuItem onClick={signOut} sx={combineStyles(styles.menuItem, sx)}>
            <ListItemIcon>
               <Box component={LogOut} sx={styles.icon} />
            </ListItemIcon>
            <Typography color={"text.secondary"} sx={styles.menuItemText}>
               Log out
            </Typography>
         </MenuItem>
      )
   }

   const TalentProfileMenuItems = () => {
      return (
         <Stack spacing={2} sx={styles.profileMenuRoot}>
            <Stack>
               <AvatarMenuItem />
               <Stack>
                  <ProfileMenuItem />
                  <MyJobsMenuItem />
                  <FollowingCompaniesMenuItem />
               </Stack>
            </Stack>

            <Stack spacing={2}>
               <SupportLinkMenuItem />
               <Divider sx={{ width: "90%", alignSelf: "center" }} />
               <LogOutMenuItem />
            </Stack>
         </Stack>
      )
   }

   return (
      <>
         <Stack direction={"row"} spacing={1} sx={styles.profileButton}>
            <BrandedTooltip title="Account">
               <IconButton
                  onClick={handleClick}
                  sx={styles.iconButton}
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
            </BrandedTooltip>
         </Stack>
         <Menu
            anchorEl={useNewMobileMenu ? null : anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            transformOrigin={transformOrigin}
            anchorOrigin={anchorOrigin}
            TransitionComponent={
               useNewMobileMenu ? SlideLeftTransition : undefined
            }
            disableScrollLock={disableScrollLock}
            sx={[
               useNewMobileMenu ? styles.profileMenu : null,
               talentProfileV1 ? styles.desktopProfileMenu : null,
            ]}
            TransitionProps={{
               onEntering: () => setMenuAnimating(true),
               onEntered: () => setMenuAnimating(false),
               onExit: () => setMenuAnimating(true),
               onExited: () => setMenuAnimating(false),
            }}
         >
            {useNewMobileMenu ? (
               <TalentProfileMenuItems />
            ) : (
               <Stack
                  spacing={talentProfileV1 ? 0 : 2}
                  sx={talentProfileV1 ? styles.desktopProfileMenuRoot : null}
               >
                  <ConditionalWrapper
                     condition={!talentProfileV1}
                     fallback={
                        <AvatarMenuItem sx={styles.desktopAvatarMenuItem} />
                     }
                  >
                     <MenuItem sx={{ mb: 1 }} onClick={handleProfileClick}>
                        <ColorizedAvatar
                           imageUrl={userData?.avatar}
                           lastName={userData?.lastName}
                           firstName={userData?.firstName}
                           sx={[styles.ava, { border: "none" }]}
                        />
                        <Tooltip
                           title={fieldOfStudyDisplayName}
                           disableHoverListener={disableHoverListener}
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
                  </ConditionalWrapper>
                  <ConditionalWrapper
                     condition={!talentProfileV1}
                     fallback={<ProfileMenuItem sx={styles.desktopMenuItem} />}
                  >
                     <MenuItem onClick={handleProfileClick}>
                        <ListItemIcon>
                           <PersonOutlineOutlinedIcon fontSize="small" />
                        </ListItemIcon>
                        <Typography color={"text.secondary"}>
                           Profile
                        </Typography>
                     </MenuItem>
                  </ConditionalWrapper>

                  <ConditionalWrapper
                     condition={!talentProfileV1}
                     fallback={<MyJobsMenuItem sx={styles.desktopMenuItem} />}
                  >
                     <MenuItem onClick={() => push("/profile/my-jobs")}>
                        <ListItemIcon>
                           <Briefcase width={"17.5px"} height={"17.5px"} />
                        </ListItemIcon>
                        <Typography color={"text.secondary"}>
                           My Jobs
                        </Typography>
                     </MenuItem>
                  </ConditionalWrapper>

                  {talentProfileV1 ? (
                     <FollowingCompaniesMenuItem
                        sx={styles.desktopFollowingCompaniesMenuItem}
                     />
                  ) : null}

                  <ConditionalWrapper condition={!talentProfileV1}>
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
                        <Typography color={"text.secondary"}>
                           Referrals
                        </Typography>
                     </MenuItem>
                     <MenuItem
                        onClick={() => push("/profile/saved-recruiters")}
                     >
                        <ListItemIcon>
                           <ContentPasteOutlinedIcon fontSize="small" />
                        </ListItemIcon>
                        <Typography color={"text.secondary"}>
                           My Recruiters
                        </Typography>
                     </MenuItem>
                  </ConditionalWrapper>

                  <Divider
                     sx={{
                        width: talentProfileV1 ? "90%" : "80%",
                        alignSelf: "center",
                     }}
                  />

                  <ConditionalWrapper
                     condition={!talentProfileV1}
                     fallback={
                        <LogOutMenuItem sx={styles.desktopLogoutMenuItem} />
                     }
                  >
                     <MenuItem
                        onClick={signOut}
                        sx={{ marginTop: "0 !important" }}
                     >
                        <ListItemIcon>
                           <LogoutOutlinedIcon fontSize="small" />
                        </ListItemIcon>
                        <Typography color={"text.secondary"}>Logout</Typography>
                     </MenuItem>
                  </ConditionalWrapper>
               </Stack>
            )}
         </Menu>
      </>
   )
}

const transformOrigin = { horizontal: "right", vertical: "top" } as const
const anchorOrigin = { horizontal: "right", vertical: "bottom" } as const

export default ProfileMenu
