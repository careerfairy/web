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
import { supportPageLink } from "constants/links"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Briefcase, HelpCircle, LogOut, User } from "react-feather"
import { useAuth } from "../../../HOCs/AuthProvider"
import useMenuState from "../../../components/custom-hook/useMenuState"
import { getMaxLineStyles } from "../../../components/helperFunctions/HelperFunctions"
import ColorizedAvatar from "../../../components/views/common/ColorizedAvatar"
import { combineStyles, sxStyles } from "../../../types/commonTypes"

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
      wordBreak: "break-word", // Allow breaking long words
      whiteSpace: "normal", // Allow text to wrap naturally
   },
   userFieldOfStudy: {
      fontWeight: 400,
      fontSize: "12px",
      lineHeight: "16px",
   },
   profileMenu: {
      "& .MuiPaper-root": {
         minWidth: "65vw",
         maxWidth: "80vw",
         left: "unset !important",
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
   desktopProfileMenuRoot: {
      p: "12px",
      pt: 2,
   },
   menuItem: {
      p: "12px 8px",
   },
   desktopMenuItem: {
      py: 0.5,
   },
   desktopLogoutMenuItem: {
      py: 0.5,
      mt: "8px !important",
   },
   desktopFollowingCompaniesMenuItem: {
      mt: "8px !important",
   },
   avatarMenuItem: {
      p: 1,
   },
   desktopAvatarMenuItem: {
      pt: 0,
   },
})

type CustomMenuItemProps = {
   sx?: SxProps<DefaultTheme>
}

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

   const [menuHeight, setMenuHeight] = useState("100vh")

   // Function to handle correct mobile viewport height
   const handleResize = () => {
      const vh = window.innerHeight * 0.01
      setMenuHeight(`${vh * 100}px`)
   }

   useEffect(() => {
      // Set the initial height when component mounts
      handleResize()
      // Add event listener to handle viewport resizing (e.g. mobile UI showing/hiding)
      window.addEventListener("resize", handleResize)

      return () => {
         window.removeEventListener("resize", handleResize)
      }
   }, [])

   const disableHoverListener = fieldOfStudyDisplayName
      ? fieldOfStudyDisplayName?.length <= 15
      : true

   if (!userData || !userData.id) {
      return null
   }

   const AvatarMenuItem = ({ sx }: CustomMenuItemProps) => {
      return (
         <MenuItem
            sx={combineStyles(styles.avatarMenuItem, sx)}
            onClick={handleProfileClick}
         >
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
                     sx={[styles.userName]}
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
                     color={"neutral.500"}
                  >
                     {fieldOfStudyDisplayName}
                  </Typography>
               </Box>
            </Tooltip>
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
               <User width={"20px"} height={"20px"} />
            </ListItemIcon>
            <Typography color={"text.secondary"}>Profile</Typography>
         </MenuItem>
      )
   }

   const MyJobsMenuItem = ({ sx }: CustomMenuItemProps) => {
      if (!jobHubV1) return null
      return (
         <MenuItem
            onClick={() => push("/profile/my-jobs")}
            sx={combineStyles(styles.menuItem, sx)}
         >
            <ListItemIcon>
               <Briefcase width={"20px"} height={"20px"} />
            </ListItemIcon>
            <Typography color={"text.secondary"}>My Jobs</Typography>
         </MenuItem>
      )
   }

   const FollowingCompaniesMenuItem = ({ sx }: CustomMenuItemProps) => {
      return (
         <MenuItem
            onClick={() => push("/profile/following-companies")}
            sx={combineStyles(styles.menuItem, sx)}
         >
            <ListItemIcon sx={{ width: "20px", height: "20px" }}>
               <CompanyIcon />
            </ListItemIcon>
            <Typography color={"text.secondary"}>
               Following Companies
            </Typography>
         </MenuItem>
      )
   }

   const SupportLinkMenuItem = ({ sx }: CustomMenuItemProps) => {
      return (
         <Link href={supportPageLink} target="_blank">
            <MenuItem sx={combineStyles(styles.menuItem, sx)}>
               <ListItemIcon>
                  <HelpCircle width={"20px"} height={"20px"} />
               </ListItemIcon>
               <Typography color={"text.secondary"}>Support</Typography>
            </MenuItem>
         </Link>
      )
   }

   const LogOutMenuItem = ({ sx }: CustomMenuItemProps) => {
      return (
         <MenuItem onClick={signOut} sx={combineStyles(styles.menuItem, sx)}>
            <ListItemIcon>
               <LogOut width={"20px"} height={"20px"} />
            </ListItemIcon>
            <Typography color={"text.secondary"}>Log out</Typography>
         </MenuItem>
      )
   }

   const TalentProfileMenuItems = () => {
      return (
         <Stack spacing={2} sx={styles.profileMenuRoot}>
            <Stack spacing={3}>
               <AvatarMenuItem />
               <Stack spacing={1}>
                  <ProfileMenuItem />
                  <MyJobsMenuItem />
                  <FollowingCompaniesMenuItem />
               </Stack>
            </Stack>

            <Stack spacing={2}>
               <SupportLinkMenuItem />
               <Divider sx={{ width: "100%", alignSelf: "center" }} />
               <LogOutMenuItem />
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
            sx={
               useNewMenu
                  ? [
                       styles.profileMenu,
                       {
                          "& .MuiList-root": {
                             height: menuHeight,
                          },
                       },
                    ]
                  : null
            }
         >
            {useNewMenu ? (
               <TalentProfileMenuItems />
            ) : (
               <Stack
                  spacing={2}
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

                  {jobHubV1 ? (
                     <ConditionalWrapper
                        condition={!talentProfileV1}
                        fallback={
                           <MyJobsMenuItem sx={styles.desktopMenuItem} />
                        }
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
                  ) : null}

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
                        width: talentProfileV1 ? "100%" : "80%",
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
